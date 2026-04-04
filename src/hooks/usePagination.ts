import { useState, useMemo } from 'react';

export interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (size: number) => void;
  totalItems: number;
}

export const usePagination = <T,>(
  items: T[],
  options: PaginationOptions = {}
): UsePaginationReturn<T> => {
  const { itemsPerPage = 10, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const totalPages = useMemo(
    () => Math.ceil(items.length / pageSize),
    [items.length, pageSize]
  );

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const previousPage = () => {
    goToPage(currentPage - 1);
  };

  const setItemsPerPage = (size: number) => {
    setPageSize(Math.max(1, size));
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage: pageSize,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
    totalItems: items.length,
  };
};
