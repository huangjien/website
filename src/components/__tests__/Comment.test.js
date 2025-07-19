import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Comment } from '../Comment';
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
jest.mock('../../lib/useSettings', () => ({
  useSettings: jest.fn(),
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
  Avatar: ({ text, src, zoomed, bordered }) => (
    <div
      data-testid="avatar"
      data-text={text}
      data-src={src}
      data-zoomed={zoomed}
      data-bordered={bordered}
    >
      {text}
    </div>
  ),
  Accordion: ({ children, shadow, bordered }) => (
    <div
      data-testid="accordion"
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
}));

// Mock fetch
global.fetch = jest.fn();

describe('Comment Component', () => {
  const mockGetSetting = jest.fn();
  const mockComments = [
    {
      id: 1,
      body: 'This is a test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      user: {
        login: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      },
    },
    {
      id: 2,
      body: 'Another test comment',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T12:00:00Z',
      user: {
        login: 'anotheruser',
        avatar_url: 'https://example.com/avatar2.jpg',
      },
    },
  ];

  const mockExtractedComments = [
    {
      id: 1,
      body: 'This is a test comment',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      'user.login': 'testuser',
      'user.avatar_url': 'https://example.com/avatar.jpg',
    },
    {
      id: 2,
      body: 'Another test comment',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T12:00:00Z',
      'user.login': 'anotheruser',
      'user.avatar_url': 'https://example.com/avatar2.jpg',
    },
  ];

  beforeEach(() => {
    // Reset and setup fetch mock
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
    useSettings.mockReturnValue({
      getSetting: mockGetSetting,
    });
    mockGetSetting.mockReturnValue('id,body,created_at,updated_at,user.login,user.avatar_url');
    extractContentAccordingContentList.mockImplementation((contentList, comment) => {
      const index = mockComments.findIndex(c => c.id === comment.id);
      return mockExtractedComments[index];
    });
  });

  it('should render comments correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(screen.getByTestId('accordion')).toBeInTheDocument();
    });

    // Wait for the accordion items to be rendered
    await waitFor(() => {
      const accordionItems = screen.getAllByTestId('accordion-item');
      expect(accordionItems).toHaveLength(2);
    });

    // Check for user names in the accordion items
    expect(screen.getAllByText('testuser')).toHaveLength(2); // Avatar and italic text
    expect(screen.getAllByText('anotheruser')).toHaveLength(2); // Avatar and italic text

    // Check for comment content
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Another test comment')).toBeInTheDocument();
  });

  it('should fetch comments with correct API endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    render(<Comment issue_id={456} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/comments?issue_number=456', {
        method: 'GET',
      });
    });
  });

  it('should display created and updated dates correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      // For first comment (created_at === updated_at)
      expect(screen.getByText(/issue.created: 2023-01-01T00:00:00Z/)).toBeInTheDocument();
      
      // For second comment (created_at !== updated_at)
      expect(screen.getByText(/issue.last_update: 2023-01-02T12:00:00Z issue.created: 2023-01-02T00:00:00Z/)).toBeInTheDocument();
    });
  });

  it('should render avatars with correct props', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      const avatars = screen.getAllByTestId('avatar');
      expect(avatars[0]).toHaveAttribute('data-text', 'testuser');
      expect(avatars[0]).toHaveAttribute('data-src', 'https://example.com/avatar.jpg');
      expect(avatars[0]).toHaveAttribute('data-zoomed', 'true');
      expect(avatars[0]).toHaveAttribute('data-bordered', 'true');
    });
  });

  it('should call extractContentAccordingContentList for each comment', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(extractContentAccordingContentList).toHaveBeenCalledTimes(2);
      expect(extractContentAccordingContentList).toHaveBeenCalledWith(
        ['id', 'body', 'created_at', 'updated_at', 'user.login', 'user.avatar_url'],
        mockComments[0]
      );
      expect(extractContentAccordingContentList).toHaveBeenCalledWith(
        ['id', 'body', 'created_at', 'updated_at', 'user.login', 'user.avatar_url'],
        mockComments[1]
      );
    });
  });

  it('should handle empty comments array', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(screen.queryByTestId('accordion-item')).not.toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<Comment issue_id={123} />);

    // Component should still render without crashing
    expect(screen.queryByTestId('accordion')).toBeInTheDocument();
  });

  it('should not render when commentList is null', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const { container } = render(<Comment issue_id={123} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should use comment content settings correctly', async () => {
    mockGetSetting.mockReturnValue('id,body,user.login');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(mockGetSetting).toHaveBeenCalledWith('comment.content');
      expect(extractContentAccordingContentList).toHaveBeenCalledWith(
        ['id', 'body', 'user.login'],
        expect.any(Object)
      );
    });
  });
});