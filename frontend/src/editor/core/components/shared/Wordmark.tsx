import type { CSSProperties } from "react";

interface WordmarkProps {
  alt?: string;
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Wordmark({ alt = "BytePaper", muted = false, className, style }: WordmarkProps) {
  const fontSize = style?.height ?? "1rem";
  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{
        ...style,
        height: "auto",
        fontSize,
        fontWeight: 650,
        lineHeight: 1,
        whiteSpace: "nowrap",
        opacity: muted ? 0.72 : undefined,
      }}
    >
      BytePaper
    </span>
  );
}
