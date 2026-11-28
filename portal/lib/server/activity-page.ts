export const ACTIVITY_PAGE_SIZES = [25, 50, 100] as const;

const AUDIT_PAGE_SIZES = [10, 25, 50, 100] as const;

export function parseActivityPageSize(value: string | null): number {
  const size = Number(value);
  return AUDIT_PAGE_SIZES.includes(size as (typeof AUDIT_PAGE_SIZES)[number]) ? size : 25;
}

/** Non-numbers and values below 1 become page 1. The caller clamps the upper bound to the last page. */
export function parseActivityPage(value: string | null): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

export function clampActivityPage(page: number, total: number, pageSize: number): number {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(page, pages);
}
