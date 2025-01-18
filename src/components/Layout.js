// components/Layout.js

import { useLongPress, useScroll } from "ahooks";
import { useEffect, useRef, useState } from "react";
// import { triggerPx } from '@/lib/global'
import packageJson from "@/../../package.json";
import NoSSR from "@/lib/NoSSR";
import { triggerPx } from "@/lib/global";
import {
  Button,
  Container,
  Icon,
  Image,
  Label,
  SidebarPushable,
  SidebarPusher,
} from "semantic-ui-react";
import SidebarComponent from "./Sidebar";

const Layout = ({ children }) => {
  const [visible, setVisible] = useState(true);
  const scroll = useScroll(null);
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useLongPress(
    () => {
      console.log("pressed");
    },
    ref,
    {
      onClick: () => {
        console.log("click");
      },
      onLongPressEnd: () => {
        console.log("released");
      },
    }
  );

  const toggleSidebar = () => {
    setVisible(!visible);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!scroll) {
      return;
    }
    var sTop = scroll.top;
    if (!show && sTop > triggerPx) {
      setShow(true);
    } else if (show && sTop < triggerPx) {
      setShow(false);
    }
  }, [show, scroll]);

  return (
    <NoSSR>
      <SidebarPushable style={{ height: "100vh" }}>
        <SidebarComponent visible={visible} />
        <SidebarPusher dimmed={false}>
          <main>{children}</main>

          <Container
            className='footer'
            style={{ position: "fixed", bottom: 0 }}
          >
            <Button
              circular
              basic
              icon
              ref={ref}
              // onClick={toggleSidebar}
              style={{ marginLeft: "auto", verticalAlign: "baseline" }}
            >
              {/* <Icon name='sidebar' /> */}
              <Image alt='menu' avatar spaced size='mini' src='favicon.ico' />
            </Button>

            <Label
              className='ui label basic'
              size='mini'
              style={{
                marginLeft: "2em",
                marginRight: "auto",
                verticalAlign: "baseline",
              }}
            >
              <a href={"mailto:" + packageJson.author}>
                {packageJson.copyright}
              </a>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" version: " + packageJson.version}
            </Label>
            <Button
              icon
              circular
              onClick={scrollToTop}
              style={{
                display: show ? "flex" : "none",
                marginRight: "auto",
                verticalAlign: "baseline",
              }}
              floated='right'
            >
              <Icon name='arrow up' />
            </Button>
          </Container>
        </SidebarPusher>
      </SidebarPushable>
    </NoSSR>
  );
};

export default Layout;
