import React from "react";
import bytepaperIconUrl from "@editor/assets/brand/bytepaper-icon.png";

interface LogoIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string;
}

export function LogoIcon({ alt = "BytePaper", ...props }: LogoIconProps) {
  return <img src={bytepaperIconUrl} alt={alt} {...props} style={{ objectFit: "contain", ...props.style }} />;
}
