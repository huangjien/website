import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Issue } from './Issue';
import { Chat } from './Chat';

export const IssueList = ({ ComponentName, data }) => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  var pages = Math.ceil(data.length / rowsPerPage);

  useEffect(() => {
    if (data) {
      Math.ceil(data.length / rowsPerPage);
    }
  }, [data, rowsPerPage]);

  const renderCell = useCallback((itemData, columnKey) => {
    switch (columnKey) {
      case 'Issue':
        return <Issue issue={itemData} />;
      case 'Chat':
        return <Chat data={itemData} />;
      default:
        return <pre>{JSON.stringify(itemData)}</pre>;
    }
  });

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    if (!data) return [];
    return data.slice(start, end);
  }, [page, data, rowsPerPage]);

  return (
    <div>
      <Table
        isStriped
        hideHeader
        aria-label="Settings"
        bottomContent={
          <div className="flex text-lg justify-center lg:gap-8 items-center">
            <span className="text-default-400 text-small">
              Total {data?.length} items
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

            <label className="flex  items-center text-default-400 text-small">
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
        className=" min-h-max w-auto text-lg lg:gap-8 lg:m-8 "
      >
        <TableHeader>
          <TableColumn key="id">id</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell aria-label={item.id} className="lg:gap-4 lg:m-4">
                {renderCell(item, ComponentName)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
