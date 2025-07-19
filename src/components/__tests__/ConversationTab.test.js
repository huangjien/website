import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversationTab from '../ConversationTab';
import { useTranslation } from 'react-i18next';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { warn } from '../Notification';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock useAudioRecording hook
jest.mock('../../hooks/useAudioRecording', () => ({
  useAudioRecording: jest.fn(),
}));

// Mock Notification
jest.mock('../Notification', () => ({
  warn: jest.fn(),
}));

// Mock @heroui/react components
jest.mock('@heroui/react', () => ({
  Textarea: ({ value, onValueChange, placeholder, isDisabled, className, ...props }) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      placeholder={placeholder}
      disabled={isDisabled}
      className={className}
      {...props}
    />
  ),
  Button: ({ children, onPressStart, onPressEnd, isDisabled, className, ...props }) => (
    <button
      data-testid="button"
      onMouseDown={() => onPressStart && onPressStart()}
      onMouseUp={() => onPressEnd && onPressEnd()}
      onTouchStart={() => onPressStart && onPressStart()}
      onTouchEnd={() => onPressEnd && onPressEnd()}
      disabled={isDisabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, content }) => (
    <div data-testid="tooltip">
      <div data-testid="tooltip-content">{content}</div>
      {children}
    </div>
  ),
  Progress: ({ isIndeterminate, className, ...props }) => (
    <div
      data-testid="progress"
      className={className}
      {...props}
    >
      Loading...
    </div>
  ),
}));

// Mock react-icons
jest.mock('react-icons/bi', () => ({
  BiMessageRoundedDetail: ({ size, className }) => (
    <div data-testid="message-icon" className={className} style={{ fontSize: size }}>
      Message Icon
    </div>
  ),
  BiMicrophone: ({ size, className }) => (
    <div data-testid="microphone-icon" className={className} style={{ fontSize: size }}>
      Microphone Icon
    </div>
  ),
}));

describe('ConversationTab Component', () => {
  const defaultProps = {
    questionText: '',
    setQuestionText: jest.fn(),
    loading: false,
    onSubmit: jest.fn(),
    onClear: jest.fn(),
    trackSpeed: 300,
  };

  const mockAudioRecording = {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    audioSrc: '',
    isRecording: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAudioRecording.mockReturnValue(mockAudioRecording);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render textarea and button', () => {
    render(<ConversationTab {...defaultProps} />);

    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('should display question text in textarea', () => {
    const questionText = 'What is the weather today?';
    render(<ConversationTab {...defaultProps} questionText={questionText} />);

    expect(screen.getByTestId('textarea')).toHaveValue(questionText);
  });

  it('should call setQuestionText when textarea value changes', async () => {
    const mockSetQuestionText = jest.fn();
    
    render(<ConversationTab {...defaultProps} setQuestionText={mockSetQuestionText} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(mockSetQuestionText).toHaveBeenCalledWith('Hello');
  });

  it('should show progress bar when loading', () => {
    render(<ConversationTab {...defaultProps} loading={true} />);

    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('should not show progress bar when not loading', () => {
    render(<ConversationTab {...defaultProps} loading={false} />);

    expect(screen.queryByTestId('progress')).not.toBeInTheDocument();
  });

  it('should disable textarea and button when loading', () => {
    render(<ConversationTab {...defaultProps} loading={true} />);

    expect(screen.getByTestId('textarea')).toBeDisabled();
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it('should show message icon by default', () => {
    render(<ConversationTab {...defaultProps} />);

    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('microphone-icon')).not.toBeInTheDocument();
  });

  it('should call onSubmit when button is clicked with valid question text', () => {
    const questionText = 'What is the weather today?';
    const mockOnSubmit = jest.fn();
    
    render(
      <ConversationTab 
        {...defaultProps} 
        questionText={questionText}
        onSubmit={mockOnSubmit}
      />
    );

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(mockOnSubmit).toHaveBeenCalledWith(questionText);
  });

  it('should show warning when button is clicked with short question text', () => {
    const questionText = 'Hi';
    
    render(
      <ConversationTab 
        {...defaultProps} 
        questionText={questionText}
      />
    );

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(warn).toHaveBeenCalledWith('Please input a meaningful question');
  });

  it('should show warning when button is clicked with undefined question text', () => {
    render(
      <ConversationTab 
        {...defaultProps} 
        questionText={undefined}
      />
    );

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(warn).toHaveBeenCalledWith('Please input a meaningful question');
  });

  it('should start recording on long press', async () => {
    const mockStartRecording = jest.fn();
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      startRecording: mockStartRecording,
    });

    render(<ConversationTab {...defaultProps} trackSpeed={300} />);

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    
    // Advance timers to trigger long press
    jest.advanceTimersByTime(300);
    
    expect(mockStartRecording).toHaveBeenCalled();
  });

  it('should show microphone icon during recording', async () => {
    const mockStartRecording = jest.fn();
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      startRecording: mockStartRecording,
    });

    render(<ConversationTab {...defaultProps} trackSpeed={300} />);

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    
    // Advance timers to trigger long press
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(screen.getByTestId('microphone-icon')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('message-icon')).not.toBeInTheDocument();
  });

  it('should stop recording when long press ends', async () => {
    const mockStartRecording = jest.fn();
    const mockStopRecording = jest.fn();
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<ConversationTab {...defaultProps} trackSpeed={300} />);

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    
    // Advance timers to trigger long press and state updates
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    expect(mockStartRecording).toHaveBeenCalled();

    fireEvent.mouseUp(button);
    
    expect(mockStopRecording).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call setQuestionText with transcribed text after recording', async () => {
    const mockSetQuestionText = jest.fn();
    const mockStopRecording = jest.fn((callback) => {
      callback('Transcribed text from audio');
    });
    
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      stopRecording: mockStopRecording,
    });

    render(
      <ConversationTab 
        {...defaultProps} 
        setQuestionText={mockSetQuestionText}
        trackSpeed={300}
      />
    );

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    
    // Advance timers to trigger long press and state updates
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    fireEvent.mouseUp(button);
    
    expect(mockStopRecording).toHaveBeenCalledWith(expect.any(Function));
    
    // Simulate the callback being called
    const callbackFunction = mockStopRecording.mock.calls[0][0];
    callbackFunction('Transcribed text from audio');
    
    expect(mockSetQuestionText).toHaveBeenCalledWith('Transcribed text from audio');
  });

  it('should display audio player when audioSrc is available', () => {
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      audioSrc: 'blob:audio-url',
    });

    render(<ConversationTab {...defaultProps} />);

    expect(screen.getByText('ai.audio_player')).toBeInTheDocument();
    const audioElement = document.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('src', 'blob:audio-url');
  });

  it('should not display audio player when audioSrc is empty', () => {
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      audioSrc: '',
    });

    render(<ConversationTab {...defaultProps} />);

    expect(screen.queryByText('ai.audio_player')).not.toBeInTheDocument();
    expect(document.querySelector('audio')).not.toBeInTheDocument();
  });

  it('should use custom trackSpeed for long press detection', async () => {
    const mockStartRecording = jest.fn();
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      startRecording: mockStartRecording,
    });

    render(<ConversationTab {...defaultProps} trackSpeed={500} />);

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    
    // Advance timers by less than trackSpeed
    jest.advanceTimersByTime(400);
    
    expect(mockStartRecording).not.toHaveBeenCalled();
    
    // Advance timers to reach trackSpeed
    jest.advanceTimersByTime(100);
    
    expect(mockStartRecording).toHaveBeenCalled();
  });

  it('should display tooltip with correct content', () => {
    render(<ConversationTab {...defaultProps} />);

    expect(screen.getByText('ai.send_tooltip')).toBeInTheDocument();
    expect(screen.getByText('ai.hold')).toBeInTheDocument();
  });

  it('should use correct placeholder text', () => {
    render(<ConversationTab {...defaultProps} />);

    expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'ai.input_placeholder');
  });

  it('should handle touch events for mobile devices', async () => {
    const mockStartRecording = jest.fn();
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      startRecording: mockStartRecording,
    });

    render(<ConversationTab {...defaultProps} trackSpeed={300} />);

    const button = screen.getByTestId('button');
    fireEvent.touchStart(button);
    
    // Advance timers to trigger long press
    jest.advanceTimersByTime(300);
    
    expect(mockStartRecording).toHaveBeenCalled();

    fireEvent.touchEnd(button);
  });

  it('should clear timer when press ends before long press threshold', () => {
    const mockStartRecording = jest.fn();
    useAudioRecording.mockReturnValue({
      ...mockAudioRecording,
      startRecording: mockStartRecording,
    });

    render(<ConversationTab {...defaultProps} trackSpeed={300} />);

    const button = screen.getByTestId('button');
    fireEvent.mouseDown(button);
    
    // End press before threshold
    jest.advanceTimersByTime(200);
    fireEvent.mouseUp(button);
    
    // Advance past threshold
    jest.advanceTimersByTime(200);
    
    expect(mockStartRecording).not.toHaveBeenCalled();
  });
});