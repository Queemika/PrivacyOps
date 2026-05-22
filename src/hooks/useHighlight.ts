import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Returns the current ?highlight= value and a className helper that applies
 * a ring animation for ~3s when the row's id matches.
 */
export function useHighlight() {
  const [params] = useSearchParams();
  const target = params.get("highlight") || "";
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!target) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 3500);
    return () => clearTimeout(t);
  }, [target]);

  return {
    target,
    isMatch: (id: string) => !!target && active && (id === target || target.startsWith(id + ".")),
    className: (id: string) =>
      !!target && active && (id === target || target.startsWith(id + "."))
        ? "ring-2 ring-accent ring-offset-2 transition-all animate-pulse"
        : "",
  };
}
