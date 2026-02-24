type PaginationQuery = {
  pageNumber?: number | string;
  pageSize?: number | string;
};

export type PaginationInput = {
  pageNumber: number;
  pageSize: number;
  offset: number;
};

function toNumber(value: number | string | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function parsePagination(query: PaginationQuery): PaginationInput {
  const pageNumber = toNumber(query.pageNumber) ?? 1;
  const pageSize = toNumber(query.pageSize) ?? 10;

  const normalizedPageNumber = pageNumber < 1 ? 1 : Math.floor(pageNumber);
  const normalizedPageSize = pageSize < 1 ? 10 : Math.min(Math.floor(pageSize), 100);

  return {
    pageNumber: normalizedPageNumber,
    pageSize: normalizedPageSize,
    offset: (normalizedPageNumber - 1) * normalizedPageSize,
  };
}

export function normalizeOptionalString(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}
