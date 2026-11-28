import type { CSSProperties } from "react";
import bytepaperIconUrl from "@editor/assets/brand/bytepaper-icon.png";
import bytepaperLogoUrl from "@editor/assets/brand/bytepaper-logo.png";
import "@editor/ui/Logo.css";

export const APP_NAME = "BytePaper";
export const APP_TAGLINE = "Less Paper, More Possibilities";

/** iconOnly = simplified icon; textOnly = app name; iconAndText = full logo and name. */
export type LogoVariant = "iconOnly" | "iconAndText" | "textOnly";

interface LogoProps {
  variant?: LogoVariant;
  /** Layout for iconAndText: mark left of the name, or stacked above it. */
  orientation?: "horizontal" | "vertical";
  /** Height of the mark (CSS length). */
  iconHeight?: string;
  /** Height of the name (CSS length). */
  textHeight?: string;
  /** Gap between mark and name. */
  gap?: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

/**
 * App mark and name. iconOnly uses the simplified icon. iconAndText uses the
 * full logo. The name uses the current text colour.
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
  const markUrl = variant === "iconOnly" ? bytepaperIconUrl : bytepaperLogoUrl;

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
          src={markUrl}
          alt={showText ? "" : alt}
          style={{ height: iconHeight, width: "auto" }}
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
