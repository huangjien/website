import { BaseTemplate } from './BaseTemplate';
import { mockBaseTemplateProps } from './BaseTemplate.mock';

export default {
  title: 'components/template/base/BaseTemplate',
  component: BaseTemplate,
};

const Template = (args) => <BaseTemplate {...args} />;

export const Base = Template.bind({});
Base.args = {
  ...mockBaseTemplateProps.base,
};

export const Error = Template.bind({});
Error.args = {
  ...mockBaseTemplateProps.error,
};
