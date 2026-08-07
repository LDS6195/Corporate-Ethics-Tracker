"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

/** Hover/focus tooltip; positioned above the trigger, keyboard-accessible via focus. */
export default function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = 256;
    const viewportPadding = 12;
    const minLeft = viewportPadding + tooltipWidth / 2;
    const maxLeft = window.innerWidth - viewportPadding - tooltipWidth / 2;
    const unclampedLeft = rect.left + rect.width / 2;

    setPosition({
      top: rect.top - 8,
      left: Math.max(minLeft, Math.min(maxLeft, unclampedLeft)),
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  return (
    <span
      className="inline-flex items-center"
      onMouseEnter={() => {
        updatePosition();
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
        onFocus={() => {
          updatePosition();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {isMounted &&
        open &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className="pointer-events-none fixed z-[200] w-64 -translate-x-1/2 -translate-y-full rounded-md border border-sky-700/60 bg-neutral-950 p-3 text-xs font-normal leading-snug text-neutral-200 shadow-2xl"
            style={{ top: position.top, left: position.left }}
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
