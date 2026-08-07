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

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/company/");
  }

  if (href === "/about") {
    return pathname === "/about" || pathname === "/causes/about";
  }

  return pathname === href;
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

  const handleThemeToggle = () => {
    const nextIsLight = !isLightMode;
    setIsLightMode(nextIsLight);
    document.documentElement.classList.toggle("theme-light", nextIsLight);
    window.localStorage.setItem("theme", nextIsLight ? "light" : "dark");
  };

  const navShellClasses = isLightMode
    ? "mx-auto max-w-7xl rounded-xl border border-slate-300/95 bg-white/92 px-3 py-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.1)] backdrop-blur"
    : "mx-auto max-w-7xl rounded-xl border border-neutral-700 bg-[#090b0f]/95 px-3 py-3.5 shadow-[0_12px_34px_rgba(0,0,0,0.3)] backdrop-blur";

  const activeTabClasses = isLightMode
    ? "inline-flex min-w-[96px] items-center justify-center whitespace-nowrap rounded-t-lg border border-b-white border-slate-500 bg-white px-3.5 py-2.5 text-[16px] font-medium text-slate-900 shadow-[0_-1px_0_rgba(255,255,255,0.65),0_3px_10px_rgba(15,23,42,0.12)]"
    : "inline-flex min-w-[96px] items-center justify-center whitespace-nowrap rounded-t-lg border border-b-[#090b0f] border-slate-300 bg-neutral-100 px-3.5 py-2.5 text-[16px] font-medium text-neutral-950 shadow-[0_-1px_0_rgba(255,255,255,0.18),0_4px_12px_rgba(0,0,0,0.32)]";

  const inactiveTabClasses = isLightMode
    ? "mt-1 inline-flex items-center justify-center whitespace-nowrap rounded-t-lg border border-slate-300 bg-slate-100 px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:border-slate-500 hover:bg-white"
    : "mt-1 inline-flex items-center justify-center whitespace-nowrap rounded-t-lg border border-neutral-600 bg-neutral-900/80 px-4 py-2 text-[14px] font-medium text-neutral-200 transition-colors hover:border-neutral-400 hover:bg-neutral-800";

  if (pathname.startsWith("/company/")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8" aria-label="Primary">
      <div className={navShellClasses}>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="-mx-1 flex-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">
              <div className={`flex min-w-max items-end gap-1.5 border-b-2 ${isLightMode ? "border-slate-300" : "border-neutral-600"}`}>
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

            <label className={`inline-flex shrink-0 cursor-pointer items-center gap-2 self-end sm:self-auto ${isLightMode ? "text-slate-700" : "text-neutral-300"}`}>
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
          </div>
        </div>
      </div>
    </nav>
  );
}