import React from "react";

class NoSSR extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      canRender: false,
    };
  }

  componentDidMount() {
    this.setState({ canRender: true });
  }

  render() {
    const { children } = this.props;
    const { canRender } = this.state;

    return canRender ? children : null;
  }
}

export default NoSSR;
