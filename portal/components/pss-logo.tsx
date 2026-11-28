import Image from "next/image";
import Link from "next/link";
import { APP_NAME, ICON_PATH, LOGO_PATH } from "@/lib/brand";
import { withBasePath } from "@/lib/base-path";

interface PssLogoProps {
  className?: string;
  showText?: boolean;
  height?: number;
  /** Full logo where there is room; icon for a small or circular slot. */
  variant?: "logo" | "icon";
}

export function PssLogo({ className, showText = true, height = 72, variant = "logo" }: PssLogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src={withBasePath(variant === "icon" ? ICON_PATH : LOGO_PATH)}
        alt={APP_NAME}
        width={1024}
        height={1024}
        className="object-contain"
        style={{ height, width: "auto" }}
        priority
      />
      {showText && <span className="font-bold text-pss-blue dark:text-pss-gold">{APP_NAME}</span>}
    </Link>
  );
}
