import { Table } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { itemsPerPage } from '../lib/global';


const HTable = ({ columns, data }) => {
    const [tableData, setTableData] = useState();

    useEffect(() => {
        if (data) {
            setTableData(data)
        }
    }, [data])


    return (
        <>
            {tableData &&
                <Table
                    aria-label="Settings"
                    css={{
                        height: "auto",
                        minWidth: "80%",

                    }}
                    selectionMode="single" sticked striped
                >
                    <Table.Header columns={columns}>
                        {(column) => (
                            <Table.Column key={column.key}>{column.label}</Table.Column>
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
            }
        </>
    );
};

export default HTable;
