"use client";

import { useEffect } from "react";

const MAX_ENTRIES = 150;

/**
 * Injects a persistent vanilla-DOM overlay (outside React's root) that
 * captures console.error/warn/log and window.onerror, then surfaces them
 * in-browser when an error fires. Survives React crashing and re-rendering
 * the error page because it is appended directly to document.body.
 *
 * Tap the red "ERR" badge (bottom-right) to open at any time.
 */
export default function MobileDebugOverlay() {
  useEffect(() => {
    const logs: string[] = [];
    let panel: HTMLElement | null = null;
    let logList: HTMLElement | null = null;

    // --- badge (always visible, tap to open) ---
    const badge = document.createElement("button");
    badge.textContent = "DBG";
    badge.style.cssText = [
      "position:fixed;bottom:12px;right:12px;z-index:2147483646",
      "background:#374151;color:#d1d5db;font-family:monospace;font-size:10px",
      "border:1px solid #4b5563;border-radius:4px;padding:3px 7px;cursor:pointer",
      "opacity:0.6",
    ].join(";");
    document.body.appendChild(badge);

    function openPanel() {
      if (panel) {
        panel.style.display = "flex";
        return;
      }

      panel = document.createElement("div");
      panel.style.cssText = [
        "position:fixed;bottom:0;left:0;right:0;z-index:2147483647",
        "background:rgba(9,11,15,0.97);color:#e5e7eb;font-family:monospace;font-size:11px",
        "max-height:55vh;display:flex;flex-direction:column",
        "border-top:2px solid #ef4444;box-shadow:0 -4px 20px rgba(0,0,0,0.6)",
      ].join(";");

      const header = document.createElement("div");
      header.style.cssText = [
        "display:flex;justify-content:space-between;align-items:center",
        "padding:6px 10px;background:#7f1d1d;flex-shrink:0",
      ].join(";");
      header.innerHTML = `
        <span style="font-weight:bold;color:#fca5a5;font-size:12px">⚠ Debug Console</span>
        <div style="display:flex;gap:6px">
          <button id="dbg-copy" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:2px 9px;border-radius:3px;cursor:pointer;font-size:10px;font-family:monospace">Copy all</button>
          <button id="dbg-clear" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:2px 9px;border-radius:3px;cursor:pointer;font-size:10px;font-family:monospace">Clear</button>
          <button id="dbg-close" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:2px 9px;border-radius:3px;cursor:pointer;font-size:10px;font-family:monospace">✕</button>
        </div>
      `;

      logList = document.createElement("div");
      logList.style.cssText = "overflow-y:auto;flex:1;padding:6px 10px;display:flex;flex-direction:column;gap:1px";

      // Replay any logs captured before the panel was opened.
      for (const entry of logs) appendLine(entry);

      panel.appendChild(header);
      panel.appendChild(logList);
      document.body.appendChild(panel);

      panel.querySelector<HTMLButtonElement>("#dbg-close")?.addEventListener("click", () => {
        panel!.style.display = "none";
      });
      panel.querySelector<HTMLButtonElement>("#dbg-copy")?.addEventListener("click", () => {
        const text = logs.join("\n");
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
          fallbackCopy(text);
        }
      });
      panel.querySelector<HTMLButtonElement>("#dbg-clear")?.addEventListener("click", () => {
        logs.length = 0;
        if (logList) logList.innerHTML = "";
      });
    }

    function fallbackCopy(text: string) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    function appendLine(entry: string) {
      if (!logList) return;
      const line = document.createElement("div");
      const isError = entry.includes("] ERROR:");
      const isWarn = entry.includes("] WARN:");
      line.style.cssText = [
        "padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)",
        "white-space:pre-wrap;word-break:break-all",
        `color:${isError ? "#f87171" : isWarn ? "#fb923c" : "#9ca3af"}`,
      ].join(";");
      line.textContent = entry;
      logList.appendChild(line);
      logList.scrollTop = logList.scrollHeight;
    }

    function pushLog(level: "ERROR" | "WARN" | "LOG", args: unknown[]) {
      const ts = new Date().toTimeString().slice(0, 8);
      const msg = args
        .map((a) => {
          if (a instanceof Error) return `${a.message}\n${a.stack ?? ""}`;
          try {
            return typeof a === "object" ? JSON.stringify(a, null, 2) : String(a);
          } catch {
            return "[Unserializable]";
          }
        })
        .join(" ");
      const entry = `[${ts}] ${level}: ${msg}`;
      logs.push(entry);
      if (logs.length > MAX_ENTRIES) logs.shift();
      appendLine(entry);

      if (level === "ERROR") {
        badge.style.background = "#7f1d1d";
        badge.style.color = "#fca5a5";
        badge.style.opacity = "1";
        badge.style.borderColor = "#ef4444";
        badge.textContent = "ERR";
        openPanel();
      }
    }

    // --- patch console ---
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);
    const origLog = console.log.bind(console);

    console.error = (...args: unknown[]) => { pushLog("ERROR", args); origError(...args); };
    console.warn  = (...args: unknown[]) => { pushLog("WARN", args);  origWarn(...args);  };
    console.log   = (...args: unknown[]) => { pushLog("LOG", args);   origLog(...args);   };

    // --- global error handlers ---
    const onError = (e: ErrorEvent) => {
      pushLog("ERROR", [`${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`, e.error]);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      pushLog("ERROR", ["UnhandledRejection:", e.reason]);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    badge.addEventListener("click", openPanel);

    return () => {
      console.error = origError;
      console.warn  = origWarn;
      console.log   = origLog;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      badge.remove();
      panel?.remove();
    };
  }, []);

  return null;
}
