'use client';

import React, { useState } from 'react';
import { Loader2, Inbox, ChevronRight, ChevronLeft } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  /** Rows per page. Set to 0 to disable pagination entirely. Defaults to 20. */
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'لا توجد بيانات لعرضها',
  onRowClick,
  pageSize = 20,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const paginated = pageSize > 0;
  const totalPages = paginated ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages);
  const pageData = paginated ? data.slice((safePage - 1) * pageSize, safePage * pageSize) : data;
  const rangeStart = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, data.length);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 text-[11px] font-extrabold text-slate-400 whitespace-nowrap ${col.hideOnMobile ? 'hidden lg:table-cell' : ''} ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#E11D48]" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Inbox className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 align-middle ${col.hideOnMobile ? 'hidden lg:table-cell' : ''} ${col.className ?? ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginated && !isLoading && data.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/10" dir="rtl">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            {rangeStart}–{rangeEnd} من {data.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-300 tabular-nums px-1 min-w-[3.5rem] text-center">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
