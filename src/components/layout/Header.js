import {
  Button,
  Dropdown,
  Image,
  Navbar,
  Spacer,
  Tooltip,
  useTheme,
} from '@nextui-org/react';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BiChip,
  BiCog,
  BiDetail,
  BiGlobe,
  BiHome,
  BiMoon,
  BiSun,
} from 'react-icons/bi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NoSSR from '../../lib/NoSSR';
import { useAuth } from '../../lib/useAuth';
import { useSettings } from '../../lib/useSettings';
import { languages } from '../../locales/i18n';
import Login from '../Login';

const Header = () => {
  const { setTheme } = useNextTheme();
  const { isDark, type } = useTheme();
  const {
    setLanguageCode,
    setCurrentLanguage,
    currentLanguage,
    setSpeakerName,
  } = useSettings();
  // eslint-disable-next-line no-undef
  const [language, setLanguage] = useState(new Set([currentLanguage]));
  const { user, isAdmin } = useAuth();
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
      // search in languages array for the current language and set languageCode and speakerName
      var lang = languages.find((o) => o.key === currentLanguage);
      if (lang && lang.languageCode && lang.name) {
        setLanguageCode(lang.languageCode);
        setSpeakerName(lang.name);
      } else {
        setLanguageCode(undefined);
        setSpeakerName(undefined);
      }
    }
  }, [currentLanguage, i18n]);

  return (
    <NoSSR>
      <Navbar
        id="main_header"
        isBordered={isDark}
        variant="sticky"
        css={{
          $$navbarBackgroundColor: 'transparent',
          $$navbarBlurBackgroundColor: 'transparent',
        }}
      >
        <Navbar.Brand>
          {/* <Navbar.Toggle aria-label="toggle navigation" /> */}
          <Image src="/favicon.png" alt="Logo" width={32} height={32} />
        </Navbar.Brand>
        <Navbar.Content hideIn="xs" activeColor="primary">
          <Navbar.Link id="home" href="/">
            <BiHome size="2em" /> {t('header.home')}
          </Navbar.Link>
          {isAdmin && (
            <Navbar.Link id="settings" href="/settings">
              <BiCog size="2em" />
              {t('header.settings')}
            </Navbar.Link>
          )}
          {user && (
            <Navbar.Link id="ai" href="/ai">
              <BiChip size="2em" />
              {t('header.ai')}
            </Navbar.Link>
          )}
          <Navbar.Link id="about" href="/about">
            <BiDetail size="2em" />
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
            <Button
              light
              auto
              onPress={() => {
                isDark ? setTheme('light') : setTheme('dark');
              }}
            >
              {isDark ? <BiMoon size="2em" /> : <BiSun size="2em" />}
            </Button>
          </Tooltip>
          <ToastContainer
            position={toast.POSITION.TOP_CENTER}
            autoClose={5000}
            limit={3}
            pauseOnHover
            closeOnClick
            theme={isDark ? 'dark' : 'light'}
            draggable
          />
        </Navbar.Content>
      </Navbar>
    </NoSSR>
  );
};

export default Header;
