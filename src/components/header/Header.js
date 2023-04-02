import {
  Dropdown,
  Image,
  Navbar,
  Spacer,
  Switch,
  Tooltip,
  useTheme,
} from '@nextui-org/react';
import { useSessionStorageState } from 'ahooks';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiBook, BiCertification, BiGlobe, BiHome } from 'react-icons/bi';
import NoSSR from '../../lib/NoSSR';
import { useAuth } from '../../lib/useAuth';
import { languages } from '../../locales/i18n';
import Login from '../Login';

const Header = () => {
  const { setTheme } = useNextTheme();
  const { isDark, type } = useTheme();
  // eslint-disable-next-line no-undef
  const [language, setLanguage] = useState(new Set(['en']));
  const [currentLanguage, setCurrentLanguage] = useSessionStorageState(
    'Language',
    { defaultValue: 'en' }
  );
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const chooseLanguage = (lang) => {
    // console.log(lang);
    var it = lang.values();
    //get first entry:
    var first = it.next();
    //get value out of the iterator entry:
    var value = first.value;
    setLanguage(lang);
    setCurrentLanguage(value);
  };

  useEffect(() => {
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  return (
    <NoSSR>
      <Navbar isBordered={isDark} variant="sticky">
        <Navbar.Brand>
          {/* <Navbar.Toggle aria-label="toggle navigation" /> */}
          <Image src="/favicon.png" alt="Logo" width={32} height={32} />
        </Navbar.Brand>
        <Navbar.Content hideIn="xs" activeColor="primary">
          <Navbar.Link id="home" href="/">
            <BiHome size="2em" /> {t('header.home')}
          </Navbar.Link>
          {user && (
            <Navbar.Link id="settings" href="/settings">
              <BiCertification size="2em" />
              {t('header.settings')}
            </Navbar.Link>
          )}
          <Navbar.Link id="about" href="/about">
            <BiBook size="2em" />
            {t('header.about')}
          </Navbar.Link>
          <Spacer id="space1" x={4} />
          <Navbar.Content>
            <Navbar.Item id="login">
              <Login />
            </Navbar.Item>
          </Navbar.Content>
          <Spacer id="space2" x={2} />
          <Dropdown placement="bottom-left">
            <Dropdown.Button light>
              {/* <Button flat> */}
              <BiGlobe size="2em" />
              {/* </Button> */}
            </Dropdown.Button>
            <Dropdown.Menu
              color="secondary"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={language}
              items={languages}
              onSelectionChange={chooseLanguage}
              aria-label="language"
            >
              {(item) => (
                <Dropdown.Item key={item.key}>{item.value}</Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>

          <Tooltip
            content={type === 'dark' ? t('header.night') : t('header.day')}
            placement="bottom-left"
            color="invert"
          >
            <Switch
              id="theme"
              size="sm"
              checked={isDark}
              onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
            ></Switch>
          </Tooltip>
        </Navbar.Content>
      </Navbar>
    </NoSSR>
  );
};

export default Header;
