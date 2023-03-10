import { useScroll } from 'ahooks';
import { useEffect, useState } from "react";
import { ChevronUpCircle } from 'react-iconly';
import Header from '../header/Header';
import { Box } from './Box';

const triggerPx = 128

const Layout = props => {
    const scroll = useScroll(null)
    const [show, setShow] = useState(false)

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        if (!scroll) {
            return
        }
        var sTop = scroll.top;
        if (!show && sTop > triggerPx) {
            setShow(true)
        } else if (show && sTop < triggerPx) {
            setShow(false)
        }
    }, [show, scroll]);
    return (
        <Box css={{
            maxW: "100%"
        }}>
            <Header />
            <Box xl>
                {props.children}
            </Box>
            <ChevronUpCircle className="scrollToTop" size='large'
                onClick={scrollToTop}
                style={{ display: show ? 'flex' : 'none' }} />
        </Box>
    )

};
export default Layout;