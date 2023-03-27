import { Collapse, Dropdown, Input, Navbar, Pagination } from "@nextui-org/react";
import { useDebounceEffect } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Search } from 'react-iconly';
import { Box } from '../components/layout/Box';
import { itemsPerPage } from '../lib/global';
import { HIssue } from './HIssue';

const intersection = (arrA, arrB) => arrA.filter(x => { console.log(x); arrB.has(x.toUpperCase()) })

export const HList = (data) => {
    const [listData, setListData] = useState()
    const [searchValue, setSearchValue] = useState('')
    const [labels, setLabels] = useState()
    const [selected, setSelected] = useState((["ALL"]));
    const [pageTotal, setPageTotal] = useState(0)

    const selectedValue = useMemo(
        () => Array.from(selected).join(", ").replaceAll("_", " "),
        [selected]
    );
    useDebounceEffect(() => {
        if (!searchValue) {
            return
        }
        if (listData) {
            const filterred = listData.filter(issue => {
                var regex = new RegExp("Ral", "i")
                return issue['title'].search(regex) > -1 || issue['body'].search(regex) > -1
            })
            setListData(filterred)
        }

    }, [searchValue], { wait: 2000 })

    useDebounceEffect(() => {
        if (!selected) {
            return
        }
        console.log(selected)
        if (selected.includes('ALL')) {
            setSearchValue('')
            setListData(data.data)
        } else {
            // check listData['labels.name'] contains selected
            const filteredArray = data.data.filter(value => {
                var ret = value['labels.name'].filter(x => selected.has(x.toUpperCase()))
                var len = ret.length
                return len > 0
            });
            setListData(filteredArray)
        }
    }, [selected], { wait: 2000 })

    useEffect(() => {
        if (!listData) {
            setPageTotal(0)
        } else {
            var count = Object.keys(listData).length
            if (count === 0) {
                setPageTotal(0)
            } else {
                setPageTotal(count / itemsPerPage + 1)
            }
        }

    }, [listData])

    useEffect(() => {
        if (data.header) {
            var menuItems = []
            data.header.forEach((item) => {
                menuItems.push({ key: item.toUpperCase(), value: item })
            })
            menuItems.push({ key: 'ALL', value: 'all' })
            setLabels(menuItems)
        }
        if (data.data) {
            setListData(data.data)
        }

    }, [data])

    return (
        <Box>
            <Navbar isBordered variant="sticky">
                <Navbar.Brand css={{ mr: "$4" }}>
                    <Dropdown placement="bottom-right">
                        <Dropdown.Button light>
                            <Bookmark size='medium' />
                            {selectedValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Blog Labels"
                            color="secondary" items={labels}
                            disallowEmptySelection
                            selectionMode="multiple"
                            selectedKeys={selected}
                            onSelectionChange={setSelected}
                        >
                            {(item) => (
                                <Dropdown.Item withDivider={item.key === 'ALL'} key={item.key}>{item.value}</Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </Navbar.Brand>
                <Navbar.Content
                    css={{
                        "@xsMax": {
                            w: "100%",
                            jc: "space-between",
                        },
                    }}
                >
                    {pageTotal > 0 &&
                        <Navbar.Item css={{
                            "@xsMax": {
                                w: "100%",
                                jc: "center",
                            },
                        }}>

                            <Pagination aria-label="pagination" noMargin shadow total={pageTotal} initialPage={1} />

                        </Navbar.Item>
                    }
                    <Navbar.Item
                        css={{
                            "@xsMax": {
                                w: "100%",
                                jc: "center",
                            },
                        }}
                    >
                        <Input
                            clearable
                            aria-label="search"
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            contentLeft={
                                <Search fill="var(--nextui-colors-accents6)" size={16} />
                            }
                            contentLeftStyling={false}
                            css={{
                                w: "100%",
                                "@xsMax": {
                                    mw: "300px",
                                },
                                "& .nextui-input-content--left": {
                                    h: "100%",
                                    ml: "$4",
                                    dflex: "center",
                                },
                            }}
                            placeholder="Search..."
                        />
                    </Navbar.Item>
                </Navbar.Content>
            </Navbar>

            <Collapse.Group key='Issues'>
                {listData &&
                    listData.map(issue => (
                        <HIssue title={issue.title} key={issue.updated_at} issue={issue} />
                    ))
                }
            </Collapse.Group>
        </Box>
    )
}