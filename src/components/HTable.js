import { Input, Navbar, Table } from '@nextui-org/react';
import { useDebounceEffect, useKeyPress } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiSearch } from 'react-icons/bi';
import { itemsPerPage } from '../lib/global';

const HTable = ({ columns, data }) => {
  const searchRef = useRef(null);
  const [tableData, setTableData] = useState();
  const [searchValue, setSearchValue] = useState();
  const [sortdescriptor, setSortdescriptor] = useState({
    column: '',
    direction: 'desceding',
  });
  const { t } = useTranslation();

  useKeyPress(
    'enter',
    () => {
      setSearchValue(searchRef.current.value);
    },
    {
      target: searchRef,
    },
    {
      exactMatch: true,
    }
  );

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
      }
    },
    [sortdescriptor],
    { wait: 500 }
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
                  ref={searchRef}
                  aria-label="search"
                  contentLeft={<BiSearch size="1em" />}
                  contentLeftStyling={false}
                  onClearClick={() => setSearchValue('')}
                  placeholder={t('global.search')}
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
            onSortChange={(e) => {
              setSortdescriptor(e);
            }}
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
