import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chat } from '../Chat';
import { useTranslation } from 'react-i18next';

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
  Accordion: ({ children, className }) => (
    <div data-testid="accordion" className={className}>
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
  Chip: ({ children, className, 'aria-label': ariaLabel }) => (
    <span data-testid="chip" className={className} aria-label={ariaLabel}>
      {children}
    </span>
  ),
  Button: ({ children, onPress, className, size, variant }) => (
    <button
      data-testid="button"
      onClick={onPress}
      className={className}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

// Mock react-icons
jest.mock('react-icons/bi', () => ({
  BiCopyAlt: () => <span data-testid="copy-icon">Copy</span>,
  BiPlayCircle: () => <span data-testid="play-icon">Play</span>,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('Chat Component', () => {
  const mockData = {
    question: 'What is React?',
    model: 'gpt-4',
    answer: 'React is a JavaScript library for building user interfaces.',
    question_tokens: 4,
    answer_tokens: 12,
    temperature: 0.7,
  };

  const mockPlayer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chat data correctly', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('0.7')).toBeInTheDocument();
    expect(screen.getByText('React is a JavaScript library for building user interfaces.')).toBeInTheDocument();
  });

  it('should display question and answer tokens in subtitle', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    const subtitle = screen.getByTestId('accordion-subtitle');
    expect(subtitle).toHaveTextContent('ai.question_length :4 ai.answer_length :12');
  });

  it('should render temperature chip when temperature is provided', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    const temperatureChip = screen.getByLabelText('temperature');
    expect(temperatureChip).toBeInTheDocument();
    expect(temperatureChip).toHaveTextContent('0.7');
  });

  it('should not render temperature chip when temperature is not provided', () => {
    const dataWithoutTemperature = { ...mockData };
    delete dataWithoutTemperature.temperature;

    render(<Chat data={dataWithoutTemperature} player={mockPlayer} />);

    expect(screen.queryByLabelText('temperature')).not.toBeInTheDocument();
  });

  it('should handle copy button click', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    const copyButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'What is React?\n\nmodel:gpt-4\n\nReact is a JavaScript library for building user interfaces.'
    );
  });

  it('should handle play button click', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    const playButton = screen.getByTestId('play-icon').closest('button');
    fireEvent.click(playButton);

    expect(mockPlayer).toHaveBeenCalledWith(
      'React is a JavaScript library for building user interfaces.'
    );
  });

  it('should not render anything when data is null', () => {
    const { container } = render(<Chat data={null} player={mockPlayer} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render anything when data is undefined', () => {
    const { container } = render(<Chat data={undefined} player={mockPlayer} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render markdown content correctly', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    const markdownElement = screen.getByTestId('markdown');
    expect(markdownElement).toBeInTheDocument();
    expect(markdownElement).toHaveTextContent('React is a JavaScript library for building user interfaces.');
  });

  it('should have correct CSS classes', () => {
    render(<Chat data={mockData} player={mockPlayer} />);

    const accordion = screen.getByTestId('accordion');
    expect(accordion).toHaveClass('m-2', 'w-fit');
  });
});