import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

interface RevalidateRequestBody {
  companyIds?: string[];
}

const STATIC_PATHS = ["/", "/about", "/causes", "/causes/about", "/politics"];

function getConfiguredSecret() {
  return process.env.REVALIDATE_SECRET;
}

export async function POST(request: Request) {
  const configuredSecret = getConfiguredSecret();

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured." },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-revalidate-secret");

  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = ((await request.json().catch(() => ({}))) ?? {}) as RevalidateRequestBody;
  const companyIds = Array.isArray(body.companyIds)
    ? body.companyIds.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];

  STATIC_PATHS.forEach((path) => revalidatePath(path));

  if (companyIds.length > 0) {
    companyIds.forEach((companyId) => revalidatePath(`/company/${companyId}`));
  } else {
    revalidatePath("/company/[id]", "page");
  }

  return NextResponse.json({
    ok: true,
    revalidated: STATIC_PATHS,
    companyIds,
    mode: companyIds.length > 0 ? "targeted" : "all-company-pages",
    now: new Date().toISOString(),
  });
}