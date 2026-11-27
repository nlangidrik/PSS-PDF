import pssLogoUrl from "@editor/assets/brand/pss-logo.png";

interface BrandMarkProps {
  /** Height of the seal (CSS length). */
  height?: string;
  className?: string;
}

/** PSS seal used in the navigation rail. */
export function BrandMark({ height = "1.6rem", className }: BrandMarkProps) {
  return (
    <img
      src={pssLogoUrl}
      alt="PSS PDF"
      className={className}
      style={{ height, width: height, borderRadius: "50%", objectFit: "cover", display: "block" }}
    />
  );
}
