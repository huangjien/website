import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Loading,
  Modal,
  Row,
  Text
} from '@nextui-org/react';
import { useSessionStorageState, useUpdateEffect } from 'ahooks';
import React, { useEffect, useState } from 'react';
import { Hide, Show, User } from 'react-iconly';
import { currentUser } from '../lib/global';
import { useAuth } from '../lib/useAuth';
import { useMessage } from '../lib/useMessage';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [cached, setCached] = useSessionStorageState(currentUser);
  // const [msg, setMsg] = useSessionStorageState(message);
  const [
    msg,
    fatal,
    warning,
    info,
    success,
    clear,
    messageType,
    messageContent,
    messageColor,
  ] = useMessage('default message');


  // const { setting } = useSettings()
  const [selectedKey, setSelectedKey] = useState();
  // const [error, setError] = useState();
  const { loading, error, user, login, logout } = useAuth()
  const [visible, setVisible] = React.useState(false);
  const handler = () => setVisible(true);
  const closeHandler = (removeMsg) => {
    setShowMessage(false);
    if (removeMsg) {
      clear();
    }
  };

  const clearLogin = () => {
    logout()
    setSelectedKey(undefined);
  };

  useUpdateEffect(() => {
    if (msg) {
      // show message
      setShowMessage(true);
    }
  }, [msg]);

  useEffect(() => {

    if (user) {
      setVisible(false);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedKey) return;
    if (selectedKey.toLowerCase() === 'logout') {
      clearLogin();
    }
    if (selectedKey.toLowerCase() === 'showmessage') {
      setShowMessage(true);
    }
    if (selectedKey.toLowerCase() === 'testmessage') {
      warning('This is an error');
    }
    setSelectedKey(undefined);
  }, [selectedKey]);

  return (
    <>
      {msg && (
        <Modal
          closeButton
          preventClose={messageType() === 'Error'}
          aria-labelledby="modal-title"
          open={showMessage && msg}
          onClose={closeHandler}
        >
          <Modal.Header>
            <Text color={messageColor()} id="modal-title" b size={18}>
              {messageType()}
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Row justify="space-between">
              <Text size={16}>{messageContent()}</Text>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              auto
              flat
              color="primary"
              onPress={() => closeHandler(true)}
            >
              Acknowledge
            </Button>
            <Button auto onPress={() => closeHandler(false)}>
              Keep the message
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {!user?.name && (
        <Button auto shadow onPress={handler}>
          Login
        </Button>
      )}
      {loading ? (
        <Loading />
      ) : user && user.avatar_url ? (
        user && (
          <Dropdown placement="bottom-left">
            <Dropdown.Trigger>
              <Avatar
                color={messageColor()}
                zoomed
                bordered
                text={user.name}
                src={user.avatar_url}
              />
            </Dropdown.Trigger>
            <Dropdown.Menu
              disabledKeys={msg ? [] : ['showMessage']}
              color="secondary"
              aria-label="Avatar Actions"
              onAction={setSelectedKey}
            >
              <Dropdown.Item key="email" textValue={user.email}>
                <Text color="inherit">{user.email}</Text>
              </Dropdown.Item>
              <Dropdown.Item withDivider key="showMessage">
                Message
              </Dropdown.Item>
              <Dropdown.Item key="testMessage">Test Message</Dropdown.Item>
              <Dropdown.Item
                key="logout"
                withDivider
                color="error"
                textValue="Log Out"
              >
                Log out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      ) : (
        user && <Text href="#"> {user.name} </Text>
      )}
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Please enter your Github user name and token
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
            contentRight={<User />}
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
            visibleIcon={<Show />}
            hiddenIcon={<Hide />}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Row justify="space-between">{error && <Text>{error}</Text>}</Row>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>
          <Button auto onPress={() => login(username, password)}>
            {/* <Button auto onClick={closeHandler}> */}
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;
