import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Issue } from "./Issue";
import { Chat } from "./Chat";
import { useSettings } from "../lib/useSettings";
import { BiSearch } from "react-icons/bi";
import Input from "./ui/input";
import Divider from "./ui/divider";
import { Dialog, DialogContent, DialogBody } from "./ui/dialog";
import { Joke } from "./Joke";
import { IssueModal } from "./IssueModal";

/**
 * Renders a list component that displays a list of issues or chats.
 * Provides functionality for searching, filtering, pagination, and text-to-speech.
 *
 * @param {Array} tags - An array of tags to filter the data by.
 * @param {string} ComponentName - The name of the component to render for each item in the list.
 * @param {Array} data - An array of issue or chat data.
 * @param {string} inTab - The tab name indicating the type of data being displayed. (default: 'ai')
 * @returns {JSX.Element} - The rendered list component with the filtered and paginated data.
 */
export const IssueList = ({ tags, ComponentName, data, inTab = "ai" }) => {
  const { t } = useTranslation();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [audioSrc, setAudioSrc] = useState("");
  const [pages, setPages] = useState(1);
  const { languageCode, speakerName } = useSettings();
  const [filterValue, setFilterValue] = useState("");
  const [open, setOpen] = useState(false);

  // Reset page when data changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  const handleOpenChange = useCallback((nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAudioSrc("");
    }
  }, []);

  const readText = useCallback(
    (text) => {
      setOpen(true);
      handleText2Speech(text);
    },
    [setOpen]
  );

  const renderCell = useCallback(
    (itemData, columnKey) => {
      switch (columnKey) {
        case "Issue":
          return <Issue issue={itemData} />;
        case "Chat":
          return <Chat player={readText} name={itemData.id} data={itemData} />;
        default:
          return <pre>{JSON.stringify(itemData)}</pre>;
      }
    },
    [readText]
  );

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const filterItems = useMemo(() => {
    let filteredData = data || [];
    if (filterValue && filteredData.length > 0) {
      let regex = new RegExp(filterValue, "i");
      filteredData = filteredData.filter((oneItem) => {
        return JSON.stringify(oneItem).search(regex) > -1;
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

  const handleText2Speech = async (text) => {
    const res = await fetch(
      `/api/tts?&&languageCode=${languageCode}&&name=${speakerName}&&text=${encodeURIComponent(
        text.replaceAll("\n", "")
      )}`
    );
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    setAudioSrc(audioUrl);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='m-2'>
          <DialogBody>
            <audio controls autoPlay src={audioSrc} />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <Joke />
      <div className={" min-h-max w-auto text-large lg:m-4 "}>
        <div className='lg:inline-flex flex-wrap  text-lg justify-center lg:gap-8 items-center m-4'>
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
              className='px-3 py-1 rounded-md border'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label='Previous'
            >
              Prev
            </button>
            <span className='text-small'>
              {page} / {pages}
            </span>
            <button
              type='button'
              className='px-3 py-1 rounded-md border'
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              aria-label='Next'
            >
              Next
            </button>
          </div>

          <label className='flex  items-center text-default-400 text-small'>
            {t("issue.row_per_page")}
            <select
              className='bg-transparent outline-none text-default-400 text-small'
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='15'>15</option>
            </select>
          </label>
          <Divider />
        </div>

        <div role='grid' aria-label='list' className='text-large'>
          {items.map((item, index) => (
            <div
              role='row'
              key={item.id || `item-${index}`}
              className=' lg:m-4'
            >
              <div role='gridcell'>{renderCell(item, ComponentName)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
