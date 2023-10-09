'use client';
import RootLayout from './layout';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Pagination,
  Input,
} from '@nextui-org/react';
import { useSettings } from '../lib/useSettings';
import { useAuth } from '../lib/useAuth';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useTitle } from 'ahooks';
import { BiSearch } from 'react-icons/bi';

export default function Settings() {
  const { settings } = useSettings();
  const { user, isAdmin } = useAuth();
  const { push } = useRouter();
  const { t } = useTranslation();
  useTitle(t('header.settings'));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const pages = Math.ceil(settings.length / rowsPerPage);
  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const filterItems = useMemo(() => {
    let filteredData = settings;
    if (filterValue) {
      var regex = new RegExp(filterValue, 'i');
      filteredData = filteredData.filter((oneItem) => {
        return (
          oneItem['name'].search(regex) > -1 ||
          oneItem['value'].search(regex) > -1
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

  useEffect(() => {
    if (!user) {
      push('/');
    }
  }, [user, push]);

  return (
    <RootLayout>
      <Table
        isStriped
        aria-label="Settings"
        topContent={
          <div className="flex text-lg justify-center gap-8 items-center m-1">
            <Input
              isClearable
              className="w-auto sm:max-w-[33%] mr-4"
              placeholder={t('global.search')}
              startContent={<BiSearch />}
              value={filterValue}
              onClear={() => setFilterValue('')}
              onValueChange={setFilterValue}
            />
            <span className="text-default-400 text-small">
              Total {settings.length} items
            </span>
            <Pagination
              isCompact
              showControls
              showShadow
              color="success"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />

            <label className="flex items-center text-default-400 text-small">
              Rows per page:
              <select
                className="bg-transparent outline-none text-default-400 text-small"
                onChange={onRowsPerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </label>
          </div>
        }
        className=" min-h-max text-lg "
      >
        <TableHeader>
          <TableColumn className="text-lg" key="name">
            {t('column.title.key')}
          </TableColumn>
          <TableColumn className="text-lg" key="value">
            {t('column.title.value')}
          </TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell className=" text-lg ">
                  {getKeyValue(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </RootLayout>
  );
}
