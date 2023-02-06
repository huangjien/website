import { Header } from './Header';
import { mockHeaderProps } from './Header.mock';



const Template = (args) => <Header {...args} />

export const Base = Template.bind({});
Base.args = {
    ...mockHeaderProps.base
}

export const Error = Template.bind({});
Error.args = {
    ...mockHeaderProps.error,
};

export default {
    title: 'components/Header',
    component: Header
}