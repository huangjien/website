import { Navbar, Spacer, Switch, Text, Tooltip, useTheme } from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';
import { Document, Home, Setting } from 'react-iconly';
import Login from '../Login';

const variants = [
    "default",
    "highlight",
    "highlight-solid",
    "underline",
    "highlight-rounded",
    "highlight-solid-rounded",
    "underline-rounded",
];
const Header = () => {
    const { setTheme } = useNextTheme();
    const { isDark, type } = useTheme();

    return (
        <Navbar isBordered={isDark} variant="sticky">
            <Navbar.Brand>
                <Text b hideIn="xs">
                    Jien Huang
                </Text>

            </Navbar.Brand>
            <Navbar.Content hideIn="xs" activeColor="primary" variant={variants}>
                <Navbar.Link id="home" href="/">
                    <Home size='large' /> Home
                </Navbar.Link>
                <Navbar.Link id="settings" href="/settings">
                    <Setting />Settings
                </Navbar.Link>
                <Navbar.Link id="about" href="/about">
                    <Document />About
                </Navbar.Link>
                <Spacer id="space1" x={4} />
                <Navbar.Content>
                    <Navbar.Item id="login">
                        <Login />
                    </Navbar.Item>
                </Navbar.Content>
                <Spacer id="space2" x={2} />
                <Tooltip content={type} placement="left" color="invert">
                    <Switch id="theme"
                        checked={isDark}
                        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                    >
                    </Switch>
                </Tooltip>
            </Navbar.Content>
        </Navbar>
    )
};

export default Header;