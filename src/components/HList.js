import { Collapse, Dropdown, Input, Navbar, Pagination } from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { Paper, Search } from 'react-iconly';
import { Box } from '../components/layout/Box';
import { HIssue } from './HIssue';

export const HList = (data) => {
    const [listData, setListData] = useState()
    const [labels, setLabels] = useState()

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
                            <Paper size='medium' />
                            Blog
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Blog Labels"
                            color="secondary" items={labels}
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
                    <Navbar.Item css={{
                        "@xsMax": {
                            w: "100%",
                            jc: "center",
                        },
                    }}>
                        <Pagination aria-label="pagination" noMargin shadow total={10} initialPage={1} />
                    </Navbar.Item>
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

                        // <Collapse title={issue.title} key={issue.updated_at}>{JSON.stringify(issue)}</Collapse>

                        <HIssue title={issue.title} key={issue.updated_at} issue={issue} />
                    ))
                }
            </Collapse.Group>
        </Box>
    )
}