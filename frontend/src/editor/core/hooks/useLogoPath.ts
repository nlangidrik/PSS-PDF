import { useMemo } from "react";
import { useLogoAssets } from "@editor/hooks/useLogoAssets";

/** Simplified icon. The same artwork is used in both themes. */
export function useLogoPath(): { dark: string; light: string } {
  const { folderPath } = useLogoAssets();

  return useMemo(
    () => ({
      dark: `${folderPath}/logo192.png`,
      light: `${folderPath}/logo192.png`,
    }),
    [folderPath],
  );
}
