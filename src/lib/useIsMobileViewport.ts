"use client";

import { useEffect, useState } from "react";

/** Captures the viewport width once on mount, used to pick a sensible default view (e.g. card vs list). */
export function useIsMobileViewport(breakpointPx = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < breakpointPx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isMobile;
}
