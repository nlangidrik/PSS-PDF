import type { CSSProperties } from "react";
import pssLogoUrl from "@editor/assets/brand/pss-logo.png";
import "@editor/ui/Logo.css";

const APP_NAME = "PSS PDF";

/** iconOnly = seal; textOnly = app name; iconAndText = both. */
export type LogoVariant = "iconOnly" | "iconAndText" | "textOnly";

interface LogoProps {
  variant?: LogoVariant;
  /** Layout for iconAndText: seal left of the name, or stacked above it. */
  orientation?: "horizontal" | "vertical";
  /** Height of the seal (CSS length). */
  iconHeight?: string;
  /** Height of the name (CSS length). */
  textHeight?: string;
  /** Gap between seal and name. */
  gap?: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

/**
 * PSS seal and name. The seal is the same in both themes; the name uses the
 * current text colour.
 */
export function Logo({
  variant = "iconAndText",
  orientation = "horizontal",
  iconHeight = "1.75rem",
  textHeight = "1rem",
  gap = "0.5rem",
  className,
  style,
  alt = APP_NAME,
}: LogoProps) {
  const showIcon = variant === "iconOnly" || variant === "iconAndText";
  const showText = variant === "textOnly" || variant === "iconAndText";

  const cls = [
    "sui-logo",
    orientation === "vertical" ? "sui-logo--vertical" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const layoutStyle: CSSProperties = {
    display: orientation === "vertical" ? "flex" : "inline-flex",
    flexDirection: orientation === "vertical" ? "column" : "row",
    alignItems: "center",
    gap,
  };

  return (
    <span className={cls} style={{ ...layoutStyle, ...style }}>
      {showIcon && (
        <img
          className="sui-logo__mark"
          src={pssLogoUrl}
          alt={showText ? "" : alt}
          style={{ height: iconHeight, width: iconHeight }}
        />
      )}
      {showText && (
        <span className="sui-logo__name" style={{ fontSize: textHeight }}>
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
