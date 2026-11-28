import bytepaperIconUrl from "@editor/assets/brand/bytepaper-icon.png";

interface BrandMarkProps {
  /** Height of the icon (CSS length). */
  height?: string;
  className?: string;
}

/** Simplified icon for the navigation rail and other small slots. */
export function BrandMark({ height = "1.6rem", className }: BrandMarkProps) {
  return (
    <img
      src={bytepaperIconUrl}
      alt="BytePaper"
      className={className}
      style={{ height, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
}
