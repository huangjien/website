import {
  Image,
  Link,
  Navbar,
  Spacer,
  Switch,
  Tooltip,
  useTheme,
} from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';
import { Document, Home, Setting } from 'react-iconly';
import { useAuth } from '../../lib/useAuth';
import Login from '../Login';

import NoSSR from '../../lib/NoSSR';

const Header = () => {
  const { setTheme } = useNextTheme();
  const { isDark, type } = useTheme();
  const { user } = useAuth();

  return (
    <NoSSR>
      <Navbar isBordered={isDark} variant="sticky">
        <Navbar.Brand>
          <Navbar.Toggle aria-label="toggle navigation" />
          <Image src="/favicon.png" alt="Logo" width={32} height={32} />
        </Navbar.Brand>
        <Navbar.Content hideIn="xs" activeColor="primary">
          <Navbar.Link id="home" href="/">
            <Home size="medium" /> Home
          </Navbar.Link>
          {user && (
            <Navbar.Link id="settings" href="/settings">
              <Setting size="medium" />
              Settings
            </Navbar.Link>
          )}
          <Navbar.Link id="about" href="/about">
            <Document size="medium" />
            About
          </Navbar.Link>
          <Spacer id="space1" x={4} />
          <Navbar.Content>
            <Navbar.Item id="login">
              <Login />
            </Navbar.Item>
          </Navbar.Content>
          <Spacer id="space2" x={2} />
          <Tooltip content={type} placement="left" color="invert">
            <Switch
              id="theme"
              size="sm"
              checked={isDark}
              onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
            ></Switch>
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
    </NoSSR>
  );
};

export default Header;
