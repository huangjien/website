import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IssueModal } from '../IssueModal';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

// Mock rehype-raw and remark-gfm
jest.mock('rehype-raw', () => ({}));
jest.mock('remark-gfm', () => ({}));

// Mock @heroui/react components
jest.mock('@heroui/react', () => ({
  Modal: ({ children, isOpen, onClose, size, scrollBehavior }) => (
    isOpen ? (
      <div
        data-testid="modal"
        data-size={size}
        data-scroll-behavior={scrollBehavior}
      >
        {children}
      </div>
    ) : null
  ),
  ModalContent: ({ children }) => (
    <div data-testid="modal-content">{typeof children === 'function' ? children(() => {}) : children}</div>
  ),
  ModalBody: ({ children }) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }) => (
    <div data-testid="modal-footer">{children}</div>
  ),
  Input: ({ label, value, onChange, placeholder, isRequired, ...props }) => (
    <input
      data-testid="input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={isRequired}
      {...props}
    />
  ),
  Textarea: ({ value, onChange, placeholder, minRows }) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={minRows}
    />
  ),
  Button: ({ children, color, variant, onPress, className }) => (
    <button
      data-testid="button"
      data-color={color}
      data-variant={variant}
      className={className}
      onClick={onPress}
    >
      {children}
    </button>
  ),
  CheckboxGroup: ({ children, label, orientation }) => (
    <div data-testid="checkbox-group" data-label={label} data-orientation={orientation}>
      {children}
    </div>
  ),
  Checkbox: ({ children, value }) => (
    <label data-testid="checkbox" data-value={value}>
      <input type="checkbox" value={value} />
      {children}
    </label>
  ),
  Divider: () => <hr data-testid="divider" />,
  useDisclosure: () => ({
    isOpen: true,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  }),
}));

// Mock react-icons
jest.mock('react-icons/bi', () => ({
  BiEdit: () => <div data-testid="edit-icon" />,
  BiListPlus: () => <div data-testid="list-plus-icon" />,
}));

describe('IssueModal Component', () => {
  const mockIssue = {
    id: 1,
    number: 123,
    title: 'Test Issue',
    body: 'Test issue body',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render edit button for edit action', () => {
    render(<IssueModal issue={mockIssue} action="edit" />);

    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });

  it('should render new button for new action', () => {
    render(<IssueModal action="new" />);

    expect(screen.getByTestId('list-plus-icon')).toBeInTheDocument();
  });

  it('should render modal with correct structure', () => {
    render(<IssueModal action="new" />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByTestId('modal-body')).toBeInTheDocument();
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
  });

  it('should render input and textarea fields', () => {
    render(<IssueModal action="new" />);

    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('should render checkbox group with tags', () => {
    render(<IssueModal action="new" />);

    expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    expect(screen.getByText('blog')).toBeInTheDocument();
    expect(screen.getByText('programming')).toBeInTheDocument();
    expect(screen.getByText('devops')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.getByText('novel')).toBeInTheDocument();
  });

  it('should render markdown preview area', () => {
    render(<IssueModal action="new" />);

    expect(screen.getByTestId('markdown')).toBeInTheDocument();
  });

  it('should render close and save buttons', () => {
    render(<IssueModal action="new" />);

    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(3); // new button + close + save
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should populate fields when issue is provided', () => {
    render(<IssueModal issue={mockIssue} action="edit" />);

    const titleInput = screen.getByTestId('input');
    const contentTextarea = screen.getByTestId('textarea');
    
    expect(titleInput).toHaveValue('Test Issue');
    expect(contentTextarea).toHaveValue('Test issue body');
  });

  it('should handle title input change', async () => {
    const user = userEvent.setup();
    render(<IssueModal action="new" />);

    const titleInput = screen.getByTestId('input');
    await user.type(titleInput, 'New Issue Title');

    expect(titleInput).toHaveValue('New Issue Title');
  });

  it('should handle content textarea change', async () => {
    const user = userEvent.setup();
    render(<IssueModal action="new" />);

    const contentTextarea = screen.getByTestId('textarea');
    await user.type(contentTextarea, 'New issue content');

    expect(contentTextarea).toHaveValue('New issue content');
  });

});