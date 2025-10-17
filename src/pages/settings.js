"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useSettings } from "../lib/useSettings";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useTitle } from "ahooks";
import { BiSearch } from "react-icons/bi";
import { signIn, signOut, useSession } from "next-auth/react";
import Input from "../components/ui/input";
import Button from "../components/ui/button";

export default function Settings() {
  const { settings } = useSettings();
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const { t } = useTranslation();
  useTitle(t("header.settings"));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const pages = Math.ceil((settings || []).length / rowsPerPage) || 1;

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const filterItems = useMemo(() => {
    let filteredData = settings || [];
    if (filterValue) {
      const regex = new RegExp(filterValue, "i");
      filteredData = filteredData.filter((oneItem) => {
        return (
          oneItem["name"].search(regex) > -1 ||
          oneItem["value"].search(regex) > -1
        );
      });
    }

    return filteredData;
  }, [filterValue, settings]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filterItems.slice(start, end);
  }, [page, filterItems, rowsPerPage]);

  return (
    <div className="min-h-max text-lg">
      <div className="lg:inline-flex flex-wrap text-lg justify-center gap-8 items-center m-1">
        <Input
          isClearable
          className="w-auto sm:max-w-[33%] mr-4"
          placeholder={t("global.search")}
          startContent={<BiSearch />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <span className="text-muted-foreground text-sm">
          Total {(settings || []).length} items
        </span>

        <div data-testid="pagination" className="flex items-center gap-2">
          <Button
            data-testid="prev-page"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t("global.prev") || "Prev"}
          </Button>
          <span className="text-sm">
            {t("global.page") || "Page"} <span data-testid="current-page">{page}</span> / <span data-testid="total-pages">{pages}</span>
          </span>
          <Button
            data-testid="next-page"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            {t("global.next") || "Next"}
          </Button>
        </div>

        <label className="flex items-center text-muted-foreground text-sm">
          Rows per page:
          <select
            className="ml-2 bg-transparent outline-none text-foreground text-sm border border-input rounded-md px-2 py-1"
            onChange={onRowsPerPageChange}
            value={rowsPerPage}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table data-testid="table" aria-label='Settings' className="w-full text-left min-h-max text-lg">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-lg font-semibold">{t("column.title.key")}</th>
              <th className="p-3 text-lg font-semibold">{t("column.title.value")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="odd:bg-muted/40">
                <td className="p-3 text-lg">{item.name}</td>
                <td className="p-3 text-lg">{item.value}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3" colSpan={2}>
                  {t("global.empty") || "No settings to display"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Numeric pagination (optional) */}
      <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}
      </div>
    </div>
  );
}
