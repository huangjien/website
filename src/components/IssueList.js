import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Issue } from "./Issue";
import { ArticleIndex } from "./ArticleIndex";
import { BiSearch, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import Input from "./ui/input";
import Divider from "./ui/divider";
import { Joke } from "./Joke";
import EmptyState from "./EmptyState";

const MemoizedIssue = React.memo(Issue);

/**
 * Renders a list component that displays a list of issues.
 * Provides functionality for searching, filtering, and pagination.
 *
 * @param {Array} tags - An array of tags to filter the data by.
 * @param {string} ComponentName - The name of the component to render for each item in the list.
 * @param {Array} data - An array of issue data.
 * @param {string} inTab - The tab name indicating the type of data being displayed. (default: 'issue')
 * @returns {JSX.Element} - The rendered list component with the filtered and paginated data.
 */
export const IssueList = ({
  tags: _tags,
  ComponentName,
  data,
  inTab: _inTab = "issue",
}) => {
  const { t } = useTranslation();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const [openId, setOpenId] = useState(null);

  // Reset page when data changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  const handleIssueOpenChange = useCallback((value) => {
    setOpenId(value ? value : null);
  }, []);

  const handleSelect = useCallback((id) => {
    setOpenId(id);
    const target = document.getElementById(`article-${id}`);
    if (!target) return;
    const reduceMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const renderCell = useCallback(
    (itemData, columnKey, index) => {
      switch (columnKey) {
        case "Issue":
          return (
            <MemoizedIssue
              issue={itemData}
              open={
                openId !== null &&
                String(openId) === String(itemData.id ?? index)
              }
              onOpenChange={handleIssueOpenChange}
            />
          );
        default:
          return <pre>{JSON.stringify(itemData)}</pre>;
      }
    },
    [handleIssueOpenChange, openId],
  );

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const filterItems = useMemo(() => {
    let filteredData = data || [];
    if (filterValue && filteredData.length > 0) {
      const query = filterValue.trim().toLowerCase();
      filteredData = filteredData.filter((oneItem) => {
        const labels = Array.isArray(oneItem?.["labels.name"])
          ? oneItem["labels.name"].join(" ")
          : Array.isArray(oneItem?.labels)
            ? oneItem.labels
                .map((label) => label?.name)
                .filter(Boolean)
                .join(" ")
            : "";
        const searchText = [
          oneItem?.title,
          oneItem?.body,
          oneItem?.number,
          oneItem?.["user.login"],
          labels,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (searchText.includes(query)) {
          return true;
        }
        return false;
      });
    }

    return filteredData;
  }, [filterValue, data]);

  useEffect(() => {
    if (filterItems && filterItems.length > 0) {
      const calculatedPages = Math.ceil(filterItems.length / rowsPerPage);
      setPages(calculatedPages > 0 ? calculatedPages : 1);
      // Reset to page 1 if current page exceeds total pages
      if (page > calculatedPages) {
        setPage(1);
      }
    } else {
      setPages(1);
      setPage(1);
    }
  }, [filterItems, rowsPerPage, page]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    if (!filterItems) return [];
    return filterItems.slice(start, end);
  }, [page, filterItems, rowsPerPage]);

  const indexItems = useMemo(
    () =>
      items.map((item, index) => ({
        id: item.id ?? index,
        title: item.title,
      })),
    [items],
  );

  return (
    <div>
      {!filterValue ? <Joke /> : null}
      <div className={" min-h-max w-auto text-large lg:m-4 "}>
        <div className='lg:inline-flex flex-wrap  text-lg justify-center lg:gap-8 items-center m-4 glass-card rounded-2xl p-4'>
          {/* {session && (inTab === 'issue' || inTab === 'settings') && (
            <IssueModal action={'new'} />
          )} */}
          <Input
            isClearable
            className='w-auto sm:max-w-[33%] m-4'
            placeholder={t("global.search")}
            startContent={<BiSearch />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <span className='text-default-400 text-small'>
            {t("issue.total", { total: data?.length || 0 })}
          </span>
          <div className='inline-flex items-center gap-2'>
            <button
              type='button'
              className='min-w-11 min-h-11 px-3 py-2 rounded-xl glass hover:bg-[hsla(var(--glass-bg-hover))] hover:scale-105 hover:shadow-glass transition-transform duration-fast ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }
              }}
              aria-label={t("navigation.previous", {
                defaultValue: "Previous",
              })}
              title={t("navigation.previous", { defaultValue: "Previous" })}
            >
              <BiChevronLeft size={18} />
            </button>
            <span className='text-small min-w-11 min-h-11 flex items-center justify-center px-3 py-2 rounded-lg glass'>
              {page} / {pages}
            </span>
            <button
              type='button'
              className='min-w-11 min-h-11 px-3 py-2 rounded-xl glass hover:bg-[hsla(var(--glass-bg-hover))] hover:scale-105 hover:shadow-glass transition-transform duration-fast ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setPage((p) => Math.min(pages, p + 1));
                }
              }}
              aria-label={t("navigation.next", { defaultValue: "Next" })}
              title={t("navigation.next", { defaultValue: "Next" })}
            >
              <BiChevronRight size={18} />
            </button>
          </div>

          <label className='flex  items-center text-default-400 text-small'>
            {t("issue.row_per_page")}
            <select
              className='bg-transparent outline-none text-default-400 text-small dark:bg-black/30 dark:text-white bg-white/30 rounded px-2 py-1'
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
              aria-label={t("issue.rows_per_page", {
                defaultValue: "Rows per page",
              })}
            >
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='15'>15</option>
            </select>
          </label>
          <Divider />
        </div>

        <div className='lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-8 lg:items-start'>
          <div
            role='list'
            aria-label={t("navigation.list", { defaultValue: "List" })}
            className='space-y-4 px-4 sm:px-6 lg:px-8'
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <div
                  role='listitem'
                  key={item.id || `item-${index}`}
                  id={`article-${item.id ?? index}`}
                  className='scroll-mt-24'
                >
                  {renderCell(item, ComponentName, index)}
                </div>
              ))
            ) : (
              <EmptyState
                message={t("issue.empty", {
                  defaultValue: "No issues to display",
                })}
              />
            )}
          </div>
          {ComponentName === "Issue" && (
            <aside className='hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:py-4'>
              <ArticleIndex
                items={indexItems}
                openId={openId}
                onSelect={handleSelect}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
