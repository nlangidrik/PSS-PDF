import { APP_TAGLINE, Logo } from "@editor/ui/Logo";

export interface SidebarHeaderProps {
  className?: string;
}

/** The wordmark; the brand mark sits in the rail beside it. */
export function SidebarHeader({ className }: SidebarHeaderProps) {
  return (
    <div className={`file-sidebar-header${className ? ` ${className}` : ""}`}>
      <div className="file-sidebar-brand">
        <Logo variant="textOnly" textHeight="1.3rem" />
        <span className="file-sidebar-tagline">{APP_TAGLINE}</span>
      </div>
    </div>
  );
}
