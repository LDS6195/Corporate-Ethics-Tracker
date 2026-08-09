"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "AI" },
  { href: "/causes", label: "Causes" },
  { href: "/politics", label: "Political" },
  { href: "/about", label: "About" },
];

// next.config.js sets trailingSlash: true, so usePathname() returns paths
// like "/causes/" — normalize before comparing against the trailing-slash-free hrefs.
function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isActive(pathname: string, href: string) {
  const normalizedPathname = normalizePath(pathname);

  if (href === "/") {
    return normalizedPathname === "/" || normalizedPathname.startsWith("/company/");
  }

  if (href === "/about") {
    return normalizedPathname === "/about" || normalizedPathname === "/causes/about";
  }

  return normalizedPathname === href;
}

export default function PrimaryNav() {
  const pathname = usePathname();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseLight = savedTheme === "light";
    document.documentElement.classList.toggle("theme-light", shouldUseLight);
    setIsLightMode(shouldUseLight);

    if (!savedTheme) {
      window.localStorage.setItem("theme", "dark");
    }
  }, []);

  /* Theme toggle hidden — unwrap to restore
  const handleThemeToggle = () => {
    const nextIsLight = !isLightMode;
    setIsLightMode(nextIsLight);
    document.documentElement.classList.toggle("theme-light", nextIsLight);
    window.localStorage.setItem("theme", nextIsLight ? "light" : "dark");
  };
  */

  const navShellClasses = isLightMode
    ? "mx-auto max-w-7xl rounded-xl border border-slate-300/95 bg-white/92 px-3 py-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.1)] backdrop-blur"
    : "mx-auto max-w-7xl rounded-xl border border-neutral-700 bg-[#090b0f]/95 px-3 py-3.5 shadow-[0_12px_34px_rgba(0,0,0,0.3)] backdrop-blur";

  const activeTabClasses = isLightMode
    ? "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-slate-500 bg-white px-2.5 py-2 text-[14px] font-medium text-slate-900 shadow-sm sm:w-auto sm:min-w-[96px] sm:rounded-t-lg sm:border-b-white sm:px-3.5 sm:py-2.5 sm:text-[16px] sm:shadow-[0_-1px_0_rgba(255,255,255,0.65),0_3px_10px_rgba(15,23,42,0.12)]"
    : "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-neutral-300 bg-neutral-100 px-2.5 py-2 text-[14px] font-medium text-neutral-950 shadow-sm sm:w-auto sm:min-w-[96px] sm:rounded-t-lg sm:border-b-[#090b0f] sm:px-3.5 sm:py-2.5 sm:text-[16px] sm:shadow-[0_-1px_0_rgba(255,255,255,0.18),0_4px_12px_rgba(0,0,0,0.32)]";

  const inactiveTabClasses = isLightMode
    ? "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-slate-300 bg-slate-100 px-2.5 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:border-slate-500 hover:bg-white sm:mt-1 sm:w-auto sm:rounded-t-lg sm:px-4"
    : "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-neutral-600 bg-neutral-900/80 px-2.5 py-2 text-[14px] font-medium text-neutral-200 transition-colors hover:border-neutral-400 hover:bg-neutral-800 sm:mt-1 sm:w-auto sm:rounded-t-lg sm:px-4";

  if (pathname.startsWith("/company/")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8" aria-label="Primary">
      <div className={navShellClasses}>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex-1">
              <div
                className={`grid grid-cols-4 gap-1.5 sm:flex sm:min-w-max sm:items-end sm:gap-1.5 sm:border-b-2 ${
                  isLightMode ? "sm:border-slate-300" : "sm:border-neutral-600"
                }`}
              >
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);

              return active ? (
                <span
                  key={item.href}
                  className={activeTabClasses}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={inactiveTabClasses}
                >
                  {item.label}
                </Link>
              );
            })}
              </div>
            </div>

            {/* Theme toggle hidden — unwrap the label below to restore
            <label className={`inline-flex shrink-0 cursor-pointer items-center gap-2 self-center sm:self-auto ${isLightMode ? "text-slate-700" : "text-neutral-300"}`}>
              <span className={`text-[13px] font-medium ${isLightMode ? "text-sky-700" : "text-neutral-500"}`}>
                Light mode
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isLightMode}
                aria-label="Toggle light mode"
                onClick={handleThemeToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
                  isLightMode
                    ? "border-amber-500 bg-amber-400/90"
                    : "border-neutral-700 bg-neutral-800"
                }`}
              >
                <span
                  className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    isLightMode ? "translate-x-0.5" : "translate-x-4"
                  }`}
                />
              </button>
              <span className={`text-[13px] font-medium ${isLightMode ? "text-slate-500" : "text-sky-300"}`}>
                Dark mode
              </span>
            </label>
            */}
          </div>
        </div>
      </div>
    </nav>
  );
}