import { Navbar, Text } from '@nextui-org/react';

const Header = () => (
    <Navbar variant="sticky">
        <Navbar.Brand>
            <Text b hideIn="xs">
                Jien Huang
            </Text>
        </Navbar.Brand>
        <Navbar.Content hideIn="xs" enableCursorHighlight activeColor="secondary" variant="highlight-rounded">
            <Navbar.Link id="home" href="/">
                Home
            </Navbar.Link>
            <Navbar.Link id="settings" href="/settings">
                Settings
            </Navbar.Link>
            <Navbar.Link id="about" href="/about">
                About
            </Navbar.Link>
        </Navbar.Content>
    </Navbar>
);

export default Header;