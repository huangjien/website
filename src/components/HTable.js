import { Table, useAsyncList, useCollator } from '@nextui-org/react';
import { useEffect, useState } from 'react';

const HTable = ({ columns, data }) => {
    const [tableData, setTableData] = useState();
    const collator = useCollator({ numeric: true });
    async function load({ signal }) {
        const items = tableData
        return items
    }
    useEffect(() => {
        if (data) {
            setTableData(data)
            load
        }
    }, [data])
    async function sort({ items, sortDescriptor }) {
        return {
            items: items.sort((a, b) => {
                let first = a[sortDescriptor.column];
                let second = b[sortDescriptor.column];
                let cmp = collator.compare(first, second);
                if (sortDescriptor.direction === "descending") {
                    cmp *= -1;
                }
                return cmp;
            }),
        };
    }
    const list = useAsyncList({ load, sort });
    return (
        <>
            {tableData &&
                <Table
                    aria-label="Settings"
                    css={{
                        height: "auto",
                        minWidth: "80%",

                    }}
                    selectionMode="single" bordered sticked striped
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                >
                    <Table.Header columns={columns}>
                        {(column) => (
                            <Table.Column allowsSorting key={column.key}>{column.label}</Table.Column>
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
                        rowsPerPage={25}
                        onPageChange={(page) => console.log({ page })}
                    />
                </Table>
            }
        </>
    );
};

export default HTable;
