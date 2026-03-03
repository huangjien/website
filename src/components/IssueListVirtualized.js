"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLocalStorageState, useDebounceFn } from "ahooks";

export function IssueListVirtualized({ issues }) {
  const parentRef = useRef(null);

  const [rowsPerPage, setRowsPerPage] = useLocalStorageState(
    "issues_rows_per_page",
    {
      defaultValue: 10,
    },
  );
  const [page, setPage] = useLocalStorageState("issues_page", {
    defaultValue: 1,
  });
  const [filterValue, setFilterValue] = useLocalStorageState("issues_filter", {
    defaultValue: "",
  });

  const { run: handleFilterChange } = useDebounceFn(
    (value) => {
      setFilterValue(value);
      setPage(1);
    },
    { wait: 300 },
  );

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title?.toLowerCase().includes(filterValue.toLowerCase()) ||
      issue.id?.toString().includes(filterValue),
  );

  const virtualizer = useVirtualizer({
    count: filteredIssues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div className='flex flex-col h-full'>
      <div className='mb-4 flex gap-4'>
        <input
          type='text'
          placeholder='Filter issues...'
          onChange={(e) => handleFilterChange(e.target.value)}
          className='flex-1 px-4 py-2 rounded-lg border border-border bg-background'
        />
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
          className='px-4 py-2 rounded-lg border border-border bg-background'
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      <div
        ref={parentRef}
        className='flex-1 overflow-auto border border-border rounded-lg'
        style={{ height: "600px" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const issue = filteredIssues[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <IssueItem issue={issue} />
              </div>
            );
          })}
        </div>
      </div>

      <div className='mt-4 flex justify-between items-center'>
        <span className='text-sm text-muted-foreground'>
          Showing {Math.min(rowsPerPage, filteredIssues.length)} of{" "}
          {filteredIssues.length} issues
        </span>
        <div className='flex gap-2'>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent'
          >
            Previous
          </button>
          <span className='px-4 py-2'>
            Page {page} of {Math.ceil(filteredIssues.length / rowsPerPage)}
          </span>
          <button
            onClick={() =>
              setPage((p) =>
                Math.min(Math.ceil(filteredIssues.length / rowsPerPage), p + 1),
              )
            }
            disabled={page >= Math.ceil(filteredIssues.length / rowsPerPage)}
            className='px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueItem({ issue }) {
  return (
    <div className='p-4 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <h3 className='font-semibold text-lg'>{issue.title}</h3>
          <p className='text-sm text-muted-foreground mt-1'>
            #{issue.id} opened on{" "}
            {new Date(issue.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className='flex gap-2'>
          {issue.labels?.map((label) => (
            <span
              key={label}
              className='px-2 py-1 text-xs rounded-full bg-primary/10 text-primary'
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
