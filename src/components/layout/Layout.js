import ScrollToTop from '../../lib/ScrollToTop';
import Header from '../header/Header';
const layoutStyle = {
    margin: 5,
    padding: 5,
    boxSizing: 'border-box',
    maxW: "100%"
};

const Layout = props => (

    <div style={layoutStyle} >

        <Header />
        {props.children}
        <ScrollToTop />
    </div>

);
export default Layout;