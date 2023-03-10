import { useEffect, useState } from "react";
import { ChevronUpCircle } from 'react-iconly';

const triggerPx = 180

const ScrollToTop = () => {
    const [show, setShow] = useState(false)

    const checkScrollToTop = () => {
        var sTop = document.body.scrollTop || document.documentElement.scrollTop;
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
        window.addEventListener('scroll', checkScrollToTop);
        // return () => {
        //     window.removeEventListener('scroll', checkScrollToTop);
        // };
    }, []);

    return (

        <ChevronUpCircle className="scrollToTop"
            onClick={scrollToTop}
            style={{ display: show ? 'flex' : 'none' }} />

    );
};


export default ScrollToTop;
