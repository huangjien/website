import { useScroll } from 'ahooks';
import { useEffect, useState } from "react";
import { ChevronUpCircle } from 'react-iconly';
import Header from '../header/Header';

const triggerPx = 180
const layoutStyle = {
    margin: 5,
    padding: 5,
    boxSizing: 'border-box',
    maxW: "100%"
};

const Layout = props => {
    const scroll = useScroll(null)
    const [show, setShow] = useState(false)

    const checkScrollToTop = () => {
        if (!scroll) {
            return
        }
        var sTop = scroll.top;
        if (!show && sTop > triggerPx) {
            setShow(true)
        } else if (show && sTop < triggerPx) {
            setShow(false)
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        checkScrollToTop()
    }, [scroll]);
    return (
        <div  >
            <Header />
            {props.children}
            <ChevronUpCircle className="scrollToTop"
                onClick={scrollToTop}
                style={{ display: show ? 'flex' : 'none' }} />
        </div>
    )

};
export default Layout;