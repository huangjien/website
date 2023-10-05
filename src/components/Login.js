import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tooltip,
  ModalFooter,
  Text,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiHide, BiShow, BiUser } from 'react-icons/bi';
import { useAuth } from '../lib/useAuth';

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedKey, setSelectedKey] = useState();
  const { error, user, login, isAuthenticated, logout } = useAuth();
  const [visible, setVisible] = useState(true);
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

    setSelectedKey(undefined);
  }, [selectedKey]);

  return (
    <>
      {!user?.name && (
        <Tooltip content={t('header.login')}>
          <Button
            className="bg-transparent  text-success"
            auto
            shadow
            onPress={handler}
          >
            <BiUser size="2em" />
          </Button>
        </Tooltip>
      )}
      {user && user.avatar_url
        ? user && (
            <Dropdown placement="bottom-left">
              <Dropdown.Trigger>
                <Avatar
                  zoomed
                  bordered
                  alt={user.name}
                  text={user.name}
                  src={user.avatar_url}
                />
              </Dropdown.Trigger>
              <Dropdown.Menu
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
        <ModalHeader>
          <h3 id="modal-title" size={18}>
            {t('header.login_promote')}
          </h3>
        </ModalHeader>
        <ModalBody>
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
          <Input
            type="password"
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
          <h3 justify="space-between">
            {error && <Text color="error">{error}</Text>}
          </h3>
        </ModalBody>
        <ModalFooter>
          <Button auto flat color="error" onPress={closeLoginDialog}>
            {t('header.close')}
          </Button>
          <Button auto onPress={() => login(username, password)}>
            {t('header.login')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Login;
