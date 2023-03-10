import { Navbar, Switch, Text, Tooltip, useTheme } from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';
import { Document, Home, Setting } from 'react-iconly';

const Header = () => {
    const { setTheme } = useNextTheme();
    const { isDark, type } = useTheme();

    return (
        <Navbar variant="sticky">
            <Navbar.Brand>
                <Text b hideIn="xs">
                    Jien Huang
                </Text>

            </Navbar.Brand>
            <Navbar.Content hideIn="xs" enableCursorHighlight activeColor="secondary" variant="highlight-rounded">
                <Navbar.Link id="home" href="/">
                    <Home size='large' /> Home
                </Navbar.Link>
                <Navbar.Link id="settings" href="/settings">
                    <Setting />Settings
                </Navbar.Link>
                <Navbar.Link id="about" href="/about">
                    <Document />About
                </Navbar.Link>
                <Tooltip content={type} placement="left" color="invert">
                    <Switch
                        checked={isDark}
                        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                    >
                    </Switch>
                </Tooltip>

                {/* <Navbar.Switch id="theme"
                    checked={isDark}
                    onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} >

                </Navbar.Switch> */}
            </Navbar.Content>
        </Navbar>
    )
};

export default Header;