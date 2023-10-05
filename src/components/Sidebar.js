// components/Sidebar.js
import { useSessionStorageState } from 'ahooks';
import { useEffect } from 'react';
import { Sidebar, Menu, Icon, Divider } from 'semantic-ui-react';

const SidebarComponent = ({ visible }) => {
  return (
    <Sidebar
      as={Menu}
      animation="push"
      direction="left"
      icon="labeled"
      inverted
      onHide={() => {}}
      vertical
      visible={visible}
      width="thin"
    >
      <Menu.Item as="a" href="/">
        <Icon name="blogger" />
        Home
      </Menu.Item>
      <Menu.Item as="a" href="/ai">
        <Icon name="microchip" />
        AI
      </Menu.Item>
      <Menu.Item as="a" href="/settings">
        <Icon name="cog" />
        Settings
      </Menu.Item>
      <Menu.Item as="a" href="/about">
        <Icon name="content" />
        About
      </Menu.Item>
      <Divider hidden section />
      <Menu.Item as="a" floated="right">
        <Icon name="user" />
      </Menu.Item>
    </Sidebar>
  );
};

export default SidebarComponent;
