import { useEffect, useRef } from "react";

interface Props {
  width: number;
  onResize: (w: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function ResizableTh({ width, onResize, className = "", style, children }: Props) {
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = width;
    const move = (ev: MouseEvent) => {
      const next = Math.max(60, startW.current + (ev.clientX - startX.current));
      onResize(next);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <th className={`relative ${className}`} style={{ ...style, width, minWidth: width }}>
      {children}
      <span
        onMouseDown={onMouseDown}
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize select-none hover:bg-accent/40"
        aria-label="Resize column"
      />
    </th>
  );
}
