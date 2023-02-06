import Header from '../header/Header';

const layoutStyle = {
    margin: 10,
    padding: 10,

};

const Layout = props => (

    <div style={layoutStyle} >
        <Header />
        {props.children}
    </div>

);
export default Layout;