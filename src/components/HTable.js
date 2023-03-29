import { Input, Loading, Navbar, Table } from '@nextui-org/react';
import { useDebounceEffect } from 'ahooks';
import { useEffect, useState } from 'react';
import { Search } from 'react-iconly';
import { itemsPerPage } from '../lib/global';

const HTable = ({ columns, data }) => {
  const [tableData, setTableData] = useState();
  const [searchValue, setSearchValue] = useState('');
  const [sortdescriptor, setSortdescriptor] = useState({
    column: '',
    direction: 'desceding',
  });
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  useDebounceEffect(
    () => {
      if (!sortdescriptor.column) {
        return;
      }
      //sort on tableData
      if (tableData && tableData.length) {
        setLoad(true);
        const sorted = tableData.sort((a, b) => {
          const valueA = a[sortdescriptor.column];
          const valueB = b[sortdescriptor.column];
          if (valueA === valueB) {
            return 0;
          }
          if (valueA > valueB) {
            return sortdescriptor.direction === 'ascending' ? 1 : -1;
          }
          return sortdescriptor.direction === 'ascending' ? -1 : 1;
        });
        setTableData(sorted);
        setLoad(false);
      }
    },
    [sortdescriptor],
    { wait: 2000 }
  );

  useDebounceEffect(
    () => {
      if (!searchValue) {
        setTableData(data);
        return;
      }
      var regex = new RegExp(searchValue, 'i');
      const filterred = data.filter((item) => {
        var found = false;
        columns.every((column) => {
          if (item[column.key].search(regex) > -1) {
            console.log(item[column.key], column.key);
            found = true;
            return false;
          }
          return true;
        });
        return found;
      });
      setTableData(filterred);
    },
    [searchValue],
    { wait: 2000 }
  );

  return (
    <>
      {tableData && (
        <>
          {load && <Loading color="warning" />}
          <Navbar isBordered variant="sticky">
            <Navbar.Content
              css={{
                '@xsMax': {
                  w: '100%',
                  jc: 'space-between',
                },
              }}
            >
              <Navbar.Item
                css={{
                  '@xsMax': {
                    w: '100%',
                    jc: 'center',
                  },
                }}
              >
                <Input
                  clearable
                  aria-label="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  contentLeft={
                    <Search fill="var(--nextui-colors-accents6)" size={16} />
                  }
                  contentLeftStyling={false}
                  css={{
                    w: '100%',
                    '@xsMax': {
                      mw: '300px',
                    },
                    '& .nextui-input-content--left': {
                      h: '100%',
                      ml: '$4',
                      dflex: 'center',
                    },
                  }}
                  placeholder="Search..."
                />
              </Navbar.Item>
            </Navbar.Content>
          </Navbar>
          <Table
            aria-label="Settings"
            css={{
              height: 'auto',
              minWidth: '80%',
            }}
            selectionMode="single"
            sticked
            striped
            onSortChange={(e) => setSortdescriptor(e)}
            sortDescriptor={sortdescriptor}
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column key={column.key} allowsSorting>
                  {column.label}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body items={tableData}>
              {(item) => (
                <Table.Row key={item.key}>
                  {(columnKey) => <Table.Cell>{item[columnKey]}</Table.Cell>}
                </Table.Row>
              )}
            </Table.Body>
            <Table.Pagination
              shadow
              noMargin
              align="center"
              rowsPerPage={itemsPerPage}
              onPageChange={(page) => console.log({ page })}
            />
          </Table>
        </>
      )}
    </>
  );
};

export default HTable;