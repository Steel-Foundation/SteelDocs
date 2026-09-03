import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export interface Segment<T extends string> {
  value: T;
  content: ReactNode;
}

interface Props<T extends string> {
  label: string;
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
}

const SIZES = {
  md: {
    wrapper: "p-1 rounded-2xl",
    button: "gap-1.5 px-3 py-1.5 text-sm rounded-2xl",
    indicator: "rounded-2xl",
  },
  sm: {
    wrapper: "p-0.5 rounded-2xl",
    button: "gap-1 px-2.5 py-1 text-xs rounded-2xl",
    indicator: "rounded-2xl",
  },
};

export default function SegmentedControl<T extends string>({
  label,
  segments,
  value,
  onChange,
  size = "md",
}: Props<T>) {
  const buttons = useRef(new Map<T, HTMLButtonElement>());
  const wrapper = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const styles = SIZES[size];

  // global.css sets an unlayered `transition` on div/span/button, which outranks any
  // utility class, so the sliding transition has to be declared inline.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The indicator is positioned from the active button's box, so it keeps up with
  // label changes, font loading and container resizes rather than a fixed width.
  useLayoutEffect(() => {
    const measure = () => {
      const active = buttons.current.get(value);
      if (!active) return;
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();

    const observer = new ResizeObserver(measure);
    if (wrapper.current) observer.observe(wrapper.current);
    for (const button of buttons.current.values()) observer.observe(button);
    return () => observer.disconnect();
  }, [value, segments]);

  return (
    <div
      ref={wrapper}
      role="tablist"
      aria-label={label}
      className={`tracker-control relative flex shrink-0 overflow-hidden bg-teal-100 dark:bg-white/5 border border-teal-200/40 dark:border-white/10 ${styles.wrapper}`}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className={`tracker-control__active absolute left-0 bg-white dark:bg-white/10 shadow-sm ${styles.indicator}`}
          style={{
            top: size === "sm" ? 2 : 4,
            bottom: size === "sm" ? 2 : 4,
            transform: `translateX(${indicator.left}px)`,
            width: `${indicator.width}px`,
            transitionProperty: "transform, width",
            // The slide overshoots slightly then settles; the width stays on a plain
            // ease-out so the pill does not visibly stretch past its target.
            transitionDuration: reducedMotion ? "0ms, 0ms" : "420ms, 260ms",
            transitionTimingFunction: reducedMotion
              ? "linear, linear"
              : "cubic-bezier(0.34, 1.35, 0.5, 1), cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      )}

      {segments.map((segment) => (
        <button
          key={segment.value}
          ref={(node) => {
            if (node) buttons.current.set(segment.value, node);
            else buttons.current.delete(segment.value);
          }}
          type="button"
          role="tab"
          aria-selected={segment.value === value}
          onClick={() => onChange(segment.value)}
          className={`relative z-10 flex items-center font-medium cursor-pointer transition-colors ${
            styles.button
          } ${
            segment.value === value
              ? "text-teal-950 dark:text-white"
              : "text-teal-600 dark:text-white/50 hover:text-teal-950 dark:hover:text-white"
          }`}
        >
          {segment.content}
        </button>
      ))}
    </div>
  );
}
