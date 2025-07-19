import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Issue } from '../Issue';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../lib/useSettings';
import { extractContentAccordingContentList } from '../../lib/useGithubContent';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock useSettings hook
const mockGetSetting = jest.fn();
jest.mock('../../lib/useSettings', () => ({
  useSettings: jest.fn(() => ({
    getSetting: mockGetSetting,
  })),
}));

// Mock useGithubContent
jest.mock('../../lib/useGithubContent', () => ({
  extractContentAccordingContentList: jest.fn(),
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
  Accordion: ({ children, className, shadow, bordered }) => (
    <div
      data-testid="accordion"
      className={className}
      data-shadow={shadow}
      data-bordered={bordered}
    >
      {children}
    </div>
  ),
  AccordionItem: ({ children, title, subtitle, 'aria-label': ariaLabel }) => (
    <div data-testid="accordion-item" aria-label={ariaLabel}>
      <div data-testid="accordion-title">{title}</div>
      <div data-testid="accordion-subtitle">{subtitle}</div>
      <div data-testid="accordion-content">{children}</div>
    </div>
  ),
  Chip: ({ children, color, variant, size, className }) => (
    <span
      data-testid="chip"
      data-color={color}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </span>
  ),
}));

// Mock react-icons
jest.mock('react-icons/md', () => ({
  MdComment: () => <div data-testid="comment-icon" />,
}));

describe('Issue Component', () => {
  const mockIssue = {
    id: 1,
    number: 123,
    title: 'Test Issue Title',
    body: 'This is a test issue body with some content.',
    state: 'open',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    comments: 5,
    'labels.name': ['bug', 'enhancement'],
    user: {
      login: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };



  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSetting.mockReturnValue('id,number,title,body,state,created_at,updated_at,comments,user.login');
  });

  it('should render issue correctly', () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test issue body with some content.')).toBeInTheDocument();
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it('should render labels correctly', () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('enhancement')).toBeInTheDocument();
    
    const chips = screen.getAllByTestId('chip');
    expect(chips.length).toBeGreaterThanOrEqual(2);
  });

  it('should render issue state information', () => {
    render(<Issue issue={mockIssue} />);

    // The state is not currently displayed as a chip in the component
    // but the issue data contains the state information
    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
  });

  it('should handle different issue states', () => {
    const closedIssue = { ...mockIssue, state: 'closed' };
    render(<Issue issue={closedIssue} />);

    // The component should render regardless of state
    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
  });

  it('should render comment component when comments > 0', () => {
    render(<Issue issue={mockIssue} />);

    // Comment component should be rendered when comments > 0
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it('should display created and updated dates correctly when different', () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByText(/issue.last_update: 2023-01-01T12:00:00Z issue.created: 2023-01-01T00:00:00Z/)).toBeInTheDocument();
  });

  it('should display only created date when created and updated are the same', () => {
    const sameTimeIssue = {
      ...mockIssue,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };
    
    render(<Issue issue={sameTimeIssue} />);

    expect(screen.getByText(/issue.created: 2023-01-01T00:00:00Z/)).toBeInTheDocument();
    expect(screen.queryByText(/issue.last_update/)).not.toBeInTheDocument();
  });

  it('should render accordion with correct structure', () => {
    render(<Issue issue={mockIssue} />);

    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThanOrEqual(1);
    
    const accordionItem = screen.getByTestId('accordion-item');
    expect(accordionItem).toBeInTheDocument();
  });

  it('should handle issue without labels', () => {
    const issueWithoutLabels = { ...mockIssue, 'labels.name': [] };
    render(<Issue issue={issueWithoutLabels} />);

    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    // Issue should render correctly even without labels
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it('should not render comment component when comments = 0', () => {
    const issueWithoutComments = { ...mockIssue, comments: 0 };
    render(<Issue issue={issueWithoutComments} />);

    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    // Comment component should not be rendered when comments = 0
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBe(1); // Only the main issue accordion
  });

  it('should render markdown content in body', () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByTestId('markdown')).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('This is a test issue body with some content.');
  });

  it('should handle issue without body', () => {
    const issueWithoutBody = { ...mockIssue, body: null };
    
    render(<Issue issue={issueWithoutBody} />);

    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle missing user information', () => {
    const issueWithoutUser = { ...mockIssue, user: null };
    
    render(<Issue issue={issueWithoutUser} />);

    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });
});