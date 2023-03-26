import { Image, Link, Navbar, Spacer, Switch, Tooltip, useTheme } from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';
import { useContext, useEffect } from 'react';
import { Document, Home, Setting } from 'react-iconly';
import { getOneSetting, settingContext, userContext } from '../../lib/Requests';
import Login from '../Login';



const Header = () => {
    const { setTheme } = useNextTheme();
    const { isDark, type } = useTheme();
    const [data] = useContext(userContext)
    const [setting] = useContext(settingContext)

    // var userInfo = {}
    // userOneInfo.forEach(element => {
    //     userInfo[element] = result[element]
    // });

    useEffect(() => {
        if (setting) {
            var blogLabels = getOneSetting(setting, 'blog.labels')
            var blogLabelsList = blogLabels.split(',')
        }
    }, [setting])

    return (
        <Navbar isBordered={isDark} variant="sticky">
            <Navbar.Brand>
                <Navbar.Toggle aria-label="toggle navigation" />
                <Image src="/favicon.png" alt="Logo" width={32} height={32} />

            </Navbar.Brand>
            <Navbar.Content hideIn="xs" activeColor="primary" >
                <Navbar.Link id="home" href="/">
                    <Home size='medium' /> Home
                </Navbar.Link>
                {data &&
                    <Navbar.Link id="settings" href="/settings">
                        <Setting size='medium' />Settings
                    </Navbar.Link>
                }
                <Navbar.Link id="about" href="/about">
                    <Document size='medium' />About
                </Navbar.Link>
                <Spacer id="space1" x={4} />
                <Navbar.Content>
                    <Navbar.Item id="login">
                        <Login />
                    </Navbar.Item>
                </Navbar.Content>
                <Spacer id="space2" x={2} />
                <Tooltip content={type} placement="left" color="invert">
                    <Switch id="theme" size='sm'
                        checked={isDark}
                        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                    >
                    </Switch>
                </Tooltip>
            </Navbar.Content>
            <Navbar.Collapse>
                <Navbar.CollapseItem>
                    <Link id="home" href="/">
                        Home
                    </Link>
                </Navbar.CollapseItem>

                <Navbar.CollapseItem>
                    <Link id="about" href="/about">
                        About
                    </Link>
                </Navbar.CollapseItem>

            </Navbar.Collapse>

        </Navbar>
    )
};

export default Header;