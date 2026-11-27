import Image from "next/image";
import Link from "next/link";
import { APP_NAME, LOGO_PATH } from "@/lib/brand";
import { withBasePath } from "@/lib/base-path";

interface PssLogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function PssLogo({ className, showText = true, size = 40 }: PssLogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src={withBasePath(LOGO_PATH)}
        alt={APP_NAME}
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority
      />
      {showText && <span className="font-bold text-pss-blue dark:text-pss-gold">{APP_NAME}</span>}
    </Link>
  );
}
