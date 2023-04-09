import { Spacer } from '@nextui-org/react';
import { useScroll } from 'ahooks';
import { useEffect, useState } from 'react';
import { BiCaretUp } from 'react-icons/bi';

import { triggerPx } from '../../lib/global';
import { Box } from './Box';
import Header from './Header';

const Layout = (props) => {
  const scroll = useScroll(null);
  const [show, setShow] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
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
    <Box id='Layout'
      css={{
        maxW: '100%',
      }}
    >
      <Header />
      <Spacer y={1} />

      <Box>{props.children}</Box>

      <BiCaretUp
        className="scrollToTop"
        size="3em"
        onClick={scrollToTop}
        style={{ display: show ? 'flex' : 'none' }}
      />
    </Box>
  );
};
export default Layout;
