import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Modal,
  Row,
  Text,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiHide, BiShow, BiUser } from 'react-icons/bi';
import { useAuth } from '../lib/useAuth';

const Login = () => {
  // const { setTheme, isDark, type } = useNextTheme();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // const { setting } = useSettings()
  const [selectedKey, setSelectedKey] = useState();
  // const [error, setError] = useState();
  const { isAuthenticated, loading, error, user, login, logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const handler = () => setVisible(true);
  const closeLoginDialog = () => setVisible(false);

  const clearLogin = () => {
    logout();
    setSelectedKey(undefined);
  };

  useEffect(() => {
    if (isAuthenticated()) {
      setVisible(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedKey) return;
    if (selectedKey.toLowerCase() === 'logout') {
      clearLogin();
    }
    if (selectedKey.toLowerCase() === 'showmessage') {
      setShowMessage(true);
    }
    // if (selectedKey.toLowerCase() === 'testmessage') {
    //   warning('This is an error');
    // }
    setSelectedKey(undefined);
  }, [clearLogin, selectedKey]);

  return (
    <>
      {!user?.name && (
        <Button auto shadow onPress={handler}>
          {t('header.login')}
        </Button>
      )}
      {user && user.avatar_url
        ? user && (
            <Dropdown placement="bottom-left">
              <Dropdown.Trigger>
                <Avatar
                  zoomed
                  bordered
                  text={user.name}
                  src={user.avatar_url}
                />
              </Dropdown.Trigger>
              <Dropdown.Menu
                color="secondary"
                aria-label="Avatar Actions"
                onAction={setSelectedKey}
              >
                <Dropdown.Item key="email" textValue={user.email}>
                  <Text color="inherit">{user.email}</Text>
                </Dropdown.Item>

                {/* <Dropdown.Item key="testMessage">Test Message</Dropdown.Item> */}
                <Dropdown.Item
                  key="logout"
                  withDivider
                  color="error"
                  textValue="Log Out"
                >
                  {t('header.logout')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )
        : user && <Text href="#"> {user.name} </Text>}
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeLoginDialog}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            {t('header.login_promote')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            aria-label="Github User Name"
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Github User Name"
            value={username}
            contentRight={<BiUser />}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            aria-label="Github Token"
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Github Token"
            value={password}
            visibleIcon={<BiShow />}
            hiddenIcon={<BiHide />}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Row justify="space-between">
            {error && <Text color="error">{error}</Text>}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeLoginDialog}>
            {t('header.close')}
          </Button>
          <Button auto onPress={() => login(username, password)}>
            {t('header.login')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;
