#!/usr/bin/env python3
"""
SEC EDGAR ingestion pipeline for the Corporate AI Accountability Index.

Given a stock ticker, this script:
  1. Resolves the ticker to a CIK via SEC's company_tickers.json index.
  2. Pulls the company's filing history from the EDGAR submissions API.
  3. Downloads recent Form 10-K / 8-K primary documents.
  4. Scans the plain text for AI/automation/workforce keywords.
  5. Emits a JSON file of `Citation`-shaped records (see src/types/company.ts)
     that can be merged directly into src/data/companies.json.

Usage:
    python scripts/fetch_sec_data.py NVDA
    python scripts/fetch_sec_data.py MSFT --forms 10-K 8-K --limit 5
    python scripts/fetch_sec_data.py UNH --output scripts/output/unh.json

Only relies on the Python standard library (urllib, json, re) so it can run
anywhere without extra dependencies.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass
from typing import Any

# SEC requires a descriptive, compliant User-Agent identifying the requester.
# See: https://www.sec.gov/os/webmaster-faq#developers
USER_AGENT = "CorporateAIAudit admin@corp-ai-index.org"

TICKER_INDEX_URL = "https://www.sec.gov/files/company_tickers.json"
SUBMISSIONS_URL_TEMPLATE = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
ARCHIVES_URL_TEMPLATE = (
    "https://www.sec.gov/Archives/edgar/data/{cik}/{accession_nodash}/{document}"
)

DEFAULT_FORMS = ("10-K", "8-K")
DEFAULT_KEYWORDS = (
    "automation",
    "workforce reduction",
    "artificial intelligence restructuring",
    "ai efficiency",
)

# Be a good citizen: SEC asks for no more than ~10 requests/second.
REQUEST_DELAY_SECONDS = 0.25
REQUEST_TIMEOUT_SECONDS = 15
SNIPPET_CONTEXT_CHARS = 220


@dataclass
class Citation:
    """Mirrors the `Citation` interface in src/types/company.ts."""

    id: str
    title: str
    sourceName: str
    url: str
    snippet: str
    date: str
    category: str  # Always "SEC Filing" for this pipeline.


class SecEdgarClient:
    """Thin wrapper around urllib for SEC EDGAR's JSON + document endpoints."""

    def __init__(self, user_agent: str = USER_AGENT) -> None:
        self._headers = {
            "User-Agent": user_agent,
            "Accept-Encoding": "gzip, deflate",
        }
        self._last_request_time = 0.0

    def _throttle(self) -> None:
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < REQUEST_DELAY_SECONDS:
            time.sleep(REQUEST_DELAY_SECONDS - elapsed)

    def _get(self, url: str) -> bytes:
        self._throttle()
        request = urllib.request.Request(url, headers=self._headers)
        try:
            with urllib.request.urlopen(
                request, timeout=REQUEST_TIMEOUT_SECONDS
            ) as response:
                self._last_request_time = time.monotonic()
                return response.read()
        except urllib.error.HTTPError as exc:
            raise RuntimeError(f"HTTP {exc.code} fetching {url}: {exc.reason}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Network error fetching {url}: {exc.reason}") from exc

    def get_json(self, url: str) -> Any:
        return json.loads(self._get(url))

    def get_text(self, url: str) -> str:
        raw = self._get(url)
        return raw.decode("utf-8", errors="replace")


def resolve_cik(client: SecEdgarClient, ticker: str) -> str:
    """Looks up the zero-padded 10-digit CIK for a given ticker symbol."""
    ticker = ticker.strip().upper()
    index = client.get_json(TICKER_INDEX_URL)

    for entry in index.values():
        if entry.get("ticker", "").upper() == ticker:
            return f"{entry['cik_str']:010d}"

    raise ValueError(f"Ticker '{ticker}' was not found in SEC's ticker index.")


def get_recent_filings(
    client: SecEdgarClient,
    cik: str,
    forms: tuple[str, ...] = DEFAULT_FORMS,
    limit: int = 5,
) -> list[dict[str, str]]:
    """Returns the most recent filings of the requested form types."""
    submissions_url = SUBMISSIONS_URL_TEMPLATE.format(cik=int(cik))
    data = client.get_json(submissions_url)
    recent = data["filings"]["recent"]

    filings: list[dict[str, str]] = []
    for form, filing_date, accession_number, primary_document in zip(
        recent["form"],
        recent["filingDate"],
        recent["accessionNumber"],
        recent["primaryDocument"],
    ):
        if form in forms:
            filings.append(
                {
                    "form": form,
                    "filingDate": filing_date,
                    "accessionNumber": accession_number,
                    "primaryDocument": primary_document,
                }
            )
        if len(filings) >= limit:
            break

    return filings


def build_document_url(cik: str, accession_number: str, primary_document: str) -> str:
    accession_nodash = accession_number.replace("-", "")
    return ARCHIVES_URL_TEMPLATE.format(
        cik=int(cik), accession_nodash=accession_nodash, document=primary_document
    )


def strip_html(html: str) -> str:
    """Reduces an SEC HTML filing to plain, whitespace-normalized text."""
    text = re.sub(r"(?is)<(script|style).*?>.*?(</\1>)", " ", html)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;|&#160;", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_keyword_snippets(
    text: str, keywords: tuple[str, ...], context_chars: int = SNIPPET_CONTEXT_CHARS
) -> list[tuple[str, str]]:
    """Finds each keyword (case-insensitive) and returns (keyword, surrounding snippet)."""
    matches: list[tuple[str, str]] = []
    lower_text = text.lower()

    for keyword in keywords:
        start = 0
        keyword_lower = keyword.lower()
        while True:
            idx = lower_text.find(keyword_lower, start)
            if idx == -1:
                break
            snippet_start = max(0, idx - context_chars // 2)
            snippet_end = min(len(text), idx + len(keyword) + context_chars // 2)
            snippet = text[snippet_start:snippet_end].strip()
            matches.append((keyword, f"...{snippet}..."))
            start = idx + len(keyword)
            break  # Only take the first occurrence per keyword per document.

    return matches


def scan_filing_for_citations(
    client: SecEdgarClient,
    company_name: str,
    cik: str,
    filing: dict[str, str],
    keywords: tuple[str, ...],
) -> list[Citation]:
    document_url = build_document_url(
        cik, filing["accessionNumber"], filing["primaryDocument"]
    )

    try:
        html = client.get_text(document_url)
    except RuntimeError as exc:
        print(f"  [warn] skipping {document_url}: {exc}", file=sys.stderr)
        return []

    plain_text = strip_html(html)
    hits = extract_keyword_snippets(plain_text, keywords)

    citations: list[Citation] = []
    for keyword, snippet in hits:
        citation_id = f"{cik}-{filing['accessionNumber']}-{keyword.replace(' ', '-')}"
        citations.append(
            Citation(
                id=citation_id,
                title=f"Form {filing['form']} ({filing['filingDate']}) — matched '{keyword}'",
                sourceName="SEC EDGAR",
                url=document_url,
                snippet=snippet,
                date=filing["filingDate"],
                category="SEC Filing",
            )
        )

    return citations


def fetch_sec_citations(
    ticker: str,
    forms: tuple[str, ...] = DEFAULT_FORMS,
    keywords: tuple[str, ...] = DEFAULT_KEYWORDS,
    limit: int = 5,
) -> dict[str, Any]:
    client = SecEdgarClient()

    print(f"Resolving CIK for ticker '{ticker}'...")
    cik = resolve_cik(client, ticker)
    print(f"  -> CIK {cik}")

    print(f"Fetching up to {limit} filings of type {forms}...")
    filings = get_recent_filings(client, cik, forms=forms, limit=limit)
    print(f"  -> found {len(filings)} filing(s)")

    all_citations: list[Citation] = []
    for filing in filings:
        print(f"Scanning {filing['form']} filed {filing['filingDate']}...")
        all_citations.extend(
            scan_filing_for_citations(client, ticker, cik, filing, keywords)
        )

    return {
        "ticker": ticker.upper(),
        "cik": cik,
        "keywords": list(keywords),
        "citations": [asdict(c) for c in all_citations],
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch and keyword-scan SEC EDGAR filings for AI/workforce disclosures."
    )
    parser.add_argument("ticker", help="Stock ticker symbol, e.g. NVDA, MSFT, UNH")
    parser.add_argument(
        "--forms",
        nargs="+",
        default=list(DEFAULT_FORMS),
        help="SEC form types to scan (default: 10-K 8-K)",
    )
    parser.add_argument(
        "--keywords",
        nargs="+",
        default=list(DEFAULT_KEYWORDS),
        help="Keywords to search for within filing text",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="Maximum number of matching filings to scan (default: 5)",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output JSON file path (default: scripts/output/<TICKER>_sec_citations.json)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    result = fetch_sec_citations(
        ticker=args.ticker,
        forms=tuple(args.forms),
        keywords=tuple(args.keywords),
        limit=args.limit,
    )

    output_path = args.output or f"scripts/output/{args.ticker.upper()}_sec_citations.json"
    import os

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"\nWrote {len(result['citations'])} citation(s) to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
