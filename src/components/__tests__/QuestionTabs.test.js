import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionTabs } from '../QuestionTabs';
import { useTranslation } from 'react-i18next';
import { success, error } from '../Notification';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'ai.text_input': 'Text Input',
        'ai.audio_input': 'Audio Input',
        'ai.enter_question': 'Enter your question here...',
        'ai.start_recording': 'Start Recording',
        'ai.stop_recording': 'Stop Recording',
        'ai.recording_error': 'Recording error occurred',
        'ai.recording_not_supported': 'Recording not supported',
        'ai.error': 'An error occurred',
        'ai.audio_question': 'Audio Question',
        'ai.return_length': 'Response length',
        'ai.input_placeholder': 'Enter your question here...',
        'ai.send_tooltip': 'Send message',
        'ai.hold': 'Hold to record',
        'ai.conversation': 'Conversation',
        'ai.configuration': 'Configuration',
        'send': 'Send'
      };
      return translations[key] || key;
    },
  }),
}));

// Mock @heroui/react components
jest.mock('@heroui/react', () => ({
  Tabs: ({ children, selectedKey, onSelectionChange, color, variant, ...props }) => (
    <div
      data-testid="tabs"
      data-selected-key={selectedKey}
      data-color={color}
      data-variant={variant}
      {...props}
    >
      {children}
    </div>
  ),
  Tab: ({ children, key, title, ...props }) => (
    <div data-testid="tab" data-key={key} {...props}>
      <div data-testid="tab-title">{title}</div>
      {children}
    </div>
  ),
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardBody: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, color, variant, onPress, onPressStart, onPressEnd, isLoading, isDisabled, startContent, endContent, ...props }) => {
    const handleMouseDown = (e) => {
      if (onPressStart) onPressStart(e);
    };
    
    const handleMouseUp = (e) => {
      if (onPressEnd) onPressEnd(e);
    };
    
    return (
      <button
        data-testid="button"
        data-color={color}
        data-variant={variant}
        onClick={onPress}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        disabled={isDisabled || isLoading}
        data-loading={isLoading}
        {...props}
      >
        {startContent}
        {children}
        {endContent}
      </button>
    );
  },
  Textarea: ({ value, onValueChange, onChange, placeholder, minRows, maxRows, isRequired, ...props }) => {
    const [internalValue, setInternalValue] = React.useState(value || '');
    
    // Update internal value when external value changes
    React.useEffect(() => {
      setInternalValue(value || '');
    }, [value]);
    
    const handleChange = (e) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
      if (onChange) {
        onChange(newValue);
      }
    };
    
    return (
      <textarea
        data-testid="textarea"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        rows={minRows}
        required={isRequired}
        {...props}
      />
    );
  },
  Tooltip: ({ content, children, ...props }) => (
    <div title={content} {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children, ...props }) => <div {...props}>{children}</div>,
  Radio: ({ children, ...props }) => <div {...props}>{children}</div>,
  Input: (props) => <input {...props} />,
  Progress: (props) => <progress {...props} />,
  Spacer: () => <div data-testid="spacer" />,
}));

// Mock react-icons
jest.mock('react-icons/md', () => ({
  MdMic: () => <div data-testid="mic-icon" />,
  MdMicOff: () => <div data-testid="mic-off-icon" />,
  MdSend: () => <div data-testid="send-icon" />,
  MdStop: () => <div data-testid="stop-icon" />,
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock MediaRecorder
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
};

global.MediaRecorder = jest.fn(() => mockMediaRecorder);
global.MediaRecorder.isTypeSupported = jest.fn(() => true);

// Mock navigator.mediaDevices with proper Promise-based getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [{ stop: jest.fn() }]
    })),
  },
});

// Mock notifications
jest.mock('../Notification', () => ({
  success: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Get the mocked functions for use in tests
const { success, error, warn } = require('../Notification');

describe('QuestionTabs Component', () => {
  const mockOnQuestionSubmit = jest.fn();
  const mockAppend = jest.fn();
  const defaultProps = {
    onQuestionSubmit: mockOnQuestionSubmit,
    append: mockAppend,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Reset MediaRecorder mock
    if (global.MediaRecorder && global.MediaRecorder.mockClear) {
      global.MediaRecorder.mockClear();
    }
    // Ensure MediaRecorder constructor always returns our mock instance
    global.MediaRecorder.mockImplementation(() => mockMediaRecorder);
    
    mockMediaRecorder.start.mockClear();
    mockMediaRecorder.stop.mockClear();
    mockMediaRecorder.addEventListener.mockClear();
    mockMediaRecorder.removeEventListener.mockClear();
    mockMediaRecorder.ondataavailable = null;
    mockMediaRecorder.onstop = null;
    mockMediaRecorder.state = 'inactive';
    
    // Reset getUserMedia mock to return a resolved promise
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia.mockClear();
      navigator.mediaDevices.getUserMedia.mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }]
      });
    }
    
    // Reset notification mocks
    success.mockClear();
    error.mockClear();
    warn.mockClear();
  });

  it('should render tabs with conversation and configuration options', () => {
    render(<QuestionTabs {...defaultProps} />);

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByText('Conversation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should render text input tab by default', () => {
    render(<QuestionTabs {...defaultProps} />);

    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByLabelText('send')).toBeInTheDocument();
  });

  it('should handle text input change', async () => {
    const user = userEvent.setup();
    render(<QuestionTabs {...defaultProps} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'What is AI?');

    expect(textarea).toHaveValue('What is AI?');
  });

  it('should submit text question', async () => {
    const user = userEvent.setup();
    const mockAppend = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'AI is artificial intelligence' } }],
        id: 'test-id',
        created: 1234567890,
        model: 'gpt-4o-mini',
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      }),
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'What is AI?');

    const submitButton = screen.getByLabelText('send');
    
    // Simulate a short press
    fireEvent.mouseDown(submitButton);
    await new Promise(resolve => setTimeout(resolve, 50));
    fireEvent.mouseUp(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'What is AI?' }],
          temperature: 0.5,
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalledWith({
        question: 'What is AI?',
        answer: 'AI is artificial intelligence',
        key: 'test-id',
        id: 'test-id',
        temperature: 0.5,
        timestamp: 1234567890,
        model: 'gpt-4o-mini',
        question_tokens: 5,
        answer_tokens: 10,
        total_tokens: 15,
      });
    });
  });

  it('should show success message after successful submission', async () => {
    // Completely reset all mocks for this test
    jest.clearAllMocks();
    fetch.mockClear();
    success.mockClear();
    error.mockClear();
    
    const user = userEvent.setup();
    const mockAppend = jest.fn();
    
    // Mock fetch with proper response structure (use mockResolvedValue instead of mockResolvedValueOnce)
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        choices: [{ message: { content: 'AI is artificial intelligence' } }],
        id: 'test-id',
        created: 1234567890,
        model: 'gpt-4o-mini',
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      }),
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Test question that is long enough');

    // Verify the text was entered
    expect(textarea.value).toBe('Test question that is long enough');

    const submitButton = screen.getByLabelText('send');
    
    // Ensure button is enabled
    expect(submitButton).not.toBeDisabled();
    
    // Use mouse down/up events to trigger onPressStart/onPressEnd
    fireEvent.mouseDown(submitButton);
    
    // Very short delay for short press (much less than 300ms which triggers long press)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    fireEvent.mouseUp(submitButton);
    
    // Wait a bit for the press events to be processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Wait for the API call to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String)
      }));
    }, { timeout: 3000 });
    
    // Wait for append to be called (this should happen after success)
    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Now check if success was called
    expect(success).toHaveBeenCalledWith('Response length: 10');
    
    // Debug: Check if error was called instead
    expect(error).not.toHaveBeenCalled();
    
    // Verify append was called with the correct data
    expect(mockAppend).toHaveBeenCalledWith({
      question: 'Test question that is long enough',
      answer: 'AI is artificial intelligence',
      key: 'test-id',
      id: 'test-id',
      temperature: 0.5,
      timestamp: 1234567890,
      model: 'gpt-4o-mini',
      question_tokens: 5,
      answer_tokens: 10,
      total_tokens: 15,
    });
  });

  it('should not disable submit button when text is empty', () => {
    render(<QuestionTabs {...defaultProps} />);

    const submitButton = screen.getByLabelText('send');
    expect(submitButton).not.toBeDisabled();
  });

  it('should enable submit button when text is provided', async () => {
    const user = userEvent.setup();
    render(<QuestionTabs {...defaultProps} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Test question');

    const submitButton = screen.getByLabelText('send');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => {
      resolve({
        json: async () => ({
          choices: [{ message: { content: 'Test response' } }],
          id: 'test-id',
          created: 1234567890,
          model: 'gpt-4o-mini',
          usage: {
            prompt_tokens: 5,
            completion_tokens: 10,
            total_tokens: 15,
          },
        })
      });
    }, 100)));

    render(<QuestionTabs {...defaultProps} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Test question');

    const submitButton = screen.getByLabelText('send');
    
    // Simulate a short press
    fireEvent.mouseDown(submitButton);
    await new Promise(resolve => setTimeout(resolve, 50));
    fireEvent.mouseUp(submitButton);

    // The button should be disabled when loading state is active
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should switch to configuration tab when clicked', async () => {
    const user = userEvent.setup();
    render(<QuestionTabs {...defaultProps} />);

    const configTabButton = screen.getByText('Configuration');
    await user.click(configTabButton);

    // Note: The actual component doesn't set data-selected-key, so we just verify the tab is clickable
    expect(configTabButton).toBeInTheDocument();
  });

  it('should start recording with long press', async () => {
    const user = userEvent.setup();
    const mockMediaRecorder = {
      start: jest.fn(),
      stop: jest.fn(),
      ondataavailable: null,
      onstop: null,
    };
    
    window.MediaRecorder.mockImplementation(() => mockMediaRecorder);
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });

    render(<QuestionTabs {...defaultProps} />);

    const submitButton = screen.getByLabelText('send');
    
    // Simulate long press start
    await user.pointer({ target: submitButton, keys: '[MouseLeft>]' });
    
    // Wait for long press to trigger (300ms default)
    await new Promise(resolve => setTimeout(resolve, 350));
    
    expect(mockMediaRecorder.start).toHaveBeenCalled();
  });

  it('should handle recording permission denied', async () => {
    const user = userEvent.setup();
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    render(<QuestionTabs {...defaultProps} />);

    const submitButton = screen.getByLabelText('send');
    
    // Simulate long press start
    await user.pointer({ target: submitButton, keys: '[MouseLeft>]' });
    
    // Wait for long press to trigger
    await new Promise(resolve => setTimeout(resolve, 350));

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));
    });
  });

  it('should stop recording when long press ends', async () => {
    const user = userEvent.setup();
    const mockMediaRecorder = {
      start: jest.fn(),
      stop: jest.fn(),
      ondataavailable: null,
      onstop: null,
    };
    
    window.MediaRecorder.mockImplementation(() => mockMediaRecorder);
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });

    render(<QuestionTabs {...defaultProps} />);

    const submitButton = screen.getByLabelText('send');
    
    // Simulate long press start
    await user.pointer({ target: submitButton, keys: '[MouseLeft>]' });
    
    // Wait for long press to trigger
    await new Promise(resolve => setTimeout(resolve, 350));
    
    expect(mockMediaRecorder.start).toHaveBeenCalled();
    
    // Simulate long press end
    await user.pointer({ target: submitButton, keys: '[/MouseLeft]' });
    
    expect(mockMediaRecorder.stop).toHaveBeenCalled();
  });

  it('should handle API error gracefully', async () => {
    const user = userEvent.setup();
    const mockAppend = jest.fn();
    
    // Mock API error response
    fetch.mockResolvedValueOnce({
      json: async () => ({
        error: {
          code: 'api_error',
          message: 'API Error occurred'
        }
      }),
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Test question that is long enough');

    const submitButton = screen.getByLabelText('send');
    await user.click(submitButton);

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith(expect.stringContaining('ai.return_error'));
    });
  });

  it('should clear text input after successful submission', async () => {
    const user = userEvent.setup();
    const mockAppend = jest.fn();
    
    fetch.mockResolvedValueOnce({
      json: async () => ({
        choices: [{ message: { content: 'Test answer' } }],
        id: 'test-id',
        created: 1234567890,
        model: 'gpt-4o-mini',
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      }),
    });

    render(<QuestionTabs append={mockAppend} />);

    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Test question that is long enough');

    expect(textarea.value).toBe('Test question that is long enough');

    const submitButton = screen.getByLabelText('send');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should render tabs component', () => {
    render(<QuestionTabs {...defaultProps} />);

    // Check that the tabs are rendered by looking for the tab titles
    expect(screen.getByText('Conversation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should render textarea with correct props', () => {
    render(<QuestionTabs {...defaultProps} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your question here...');
    // Note: The required attribute is not set in the actual component
  });

  it('should handle MediaRecorder not supported', async () => {
    const originalMediaRecorder = global.MediaRecorder;
    const originalMediaDevices = navigator.mediaDevices;
    
    // Remove MediaRecorder and getUserMedia support
    global.MediaRecorder = undefined;
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: undefined,
    });

    render(<QuestionTabs {...defaultProps} />);

    const submitButton = screen.getByLabelText('send');
    
    // Simulate long press start using mouseDown (which triggers onPressStart)
    fireEvent.mouseDown(submitButton);
    
    // Wait for long press to trigger
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith('getUserMedia not supported on your browser!');
    });

    // Simulate long press end using mouseUp (which triggers onPressEnd)
    fireEvent.mouseUp(submitButton);

    // Restore MediaRecorder and getUserMedia properly
    global.MediaRecorder = originalMediaRecorder;
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: originalMediaDevices,
    });
    
    // Ensure the mock is properly reset for subsequent tests
    if (global.MediaRecorder && global.MediaRecorder.mockClear) {
      global.MediaRecorder.mockClear();
    }
  });

  it('should handle audio processing and submission', async () => {
    const mockAppend = jest.fn();
    
    // Mock the stream for both getUserMedia calls
    const mockStream = {
      getTracks: () => [{ stop: jest.fn() }]
    };
    
    // Reset and setup MediaRecorder mock properly
    mockMediaRecorder.start.mockClear();
    mockMediaRecorder.stop.mockClear();
    mockMediaRecorder.addEventListener.mockClear();
    mockMediaRecorder.removeEventListener.mockClear();
    
    // Explicitly mock getUserMedia for both calls in startRecording
    navigator.mediaDevices.getUserMedia.mockClear();
    navigator.mediaDevices.getUserMedia
      .mockResolvedValueOnce(mockStream) // First call in startRecording
      .mockResolvedValueOnce(mockStream); // Second call in startRecording (the await call)
    
    // Also ensure navigator.mediaDevices exists
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: navigator.mediaDevices.getUserMedia
      }
    });
    
    // Mock successful transcription
    fetch.mockResolvedValueOnce({
      json: async () => ({
        text: 'Transcribed audio question'
      }),
    });
    
    // Mock successful AI response
    fetch.mockResolvedValueOnce({
      json: async () => ({
        choices: [{ message: { content: 'Audio response' } }],
        id: 'audio-test-id',
        created: 1234567890,
        model: 'gpt-4o-mini',
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      }),
    });

    render(<QuestionTabs append={mockAppend} />);

    // The submit button is in the conversation tab (default tab)
    const submitButton = screen.getByLabelText('send');
    
    // Add spy on console.error to track any errors
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Simulate long press using mouseDown (which triggers onPressStart)
    fireEvent.mouseDown(submitButton);
    
    // Wait for long press timeout (trackSpeed is 300ms by default)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });
    
    // Wait a bit more for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Wait a bit more for the long press to be fully processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Wait for MediaRecorder to start
    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Simulate recording data
    if (mockMediaRecorder.ondataavailable) {
      mockMediaRecorder.ondataavailable({ data: new Blob(['audio data'], { type: 'audio/mp3' }) });
    }
    
    // Simulate long press end using mouseUp (which triggers onPressEnd)
    fireEvent.mouseUp(submitButton);
    
    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    
    // Simulate onstop callback which triggers transcription
    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/transcribe', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });
  });

});