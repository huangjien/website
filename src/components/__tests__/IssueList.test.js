import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IssueList } from '../IssueList'

// Mock the useSettings hook
jest.mock('@/lib/useSettings', () => ({
  useSettings: () => ({
    languageCode: 'en-US',
    speakerName: 'en-US-Standard-A'
  })
}))

// Mock fetch for TTS API
global.fetch = jest.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-audio-url')

// Mock components
jest.mock('../Issue', () => ({
  Issue: ({ issue }) => <div data-testid="issue-component">{issue.title}</div>
}))

jest.mock('../Chat', () => ({
  Chat: ({ data, player }) => (
    <div data-testid="chat-component">
      <span>{data.title}</span>
      <button onClick={() => player && player(data.body)}>Read</button>
    </div>
  )
}))

jest.mock('../Joke', () => ({
  Joke: () => <div data-testid="joke-component">Joke Component</div>
}))

jest.mock('../IssueModal', () => ({
  IssueModal: () => <div data-testid="issue-modal">Issue Modal</div>
}))

const mockData = [
  {
    id: 1,
    title: 'First Issue',
    body: 'This is the first issue content',
    labels: [{ name: 'bug' }]
  },
  {
    id: 2,
    title: 'Second Issue',
    body: 'This is the second issue content',
    labels: [{ name: 'feature' }]
  },
  {
    id: 3,
    title: 'Third Issue',
    body: 'This is the third issue content',
    labels: [{ name: 'enhancement' }]
  }
]

describe('IssueList', () => {
  beforeEach(() => {
    fetch.mockClear()
    // Mock successful TTS response
    fetch.mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['audio data'], { type: 'audio/mpeg' }))
    })
  })

  it('renders the issue list with data', () => {
    render(
      <IssueList
        tags={['bug']}
        ComponentName="Issue"
        data={mockData}
        inTab="issue"
      />
    )

    expect(screen.getByText('First Issue')).toBeInTheDocument()
    expect(screen.getByText('Second Issue')).toBeInTheDocument()
    expect(screen.getByText('Third Issue')).toBeInTheDocument()
    expect(screen.getByTestId('joke-component')).toBeInTheDocument()
  })

  it('renders chat components when ComponentName is Chat', () => {
    render(
      <IssueList
        tags={[]}
        ComponentName="Chat"
        data={mockData}
        inTab="ai"
      />
    )

    expect(screen.getAllByTestId('chat-component')).toHaveLength(3)
    expect(screen.getByText('First Issue')).toBeInTheDocument()
  })

  it('filters data based on search input', async () => {
    const user = userEvent.setup()
    
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={mockData}
        inTab="issue"
      />
    )

    const searchInput = screen.getByPlaceholderText('global.search')
    await user.type(searchInput, 'First')

    expect(screen.getByText('First Issue')).toBeInTheDocument()
    expect(screen.queryByText('Second Issue')).not.toBeInTheDocument()
    expect(screen.queryByText('Third Issue')).not.toBeInTheDocument()
  })

  it('clears search filter when clear button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={mockData}
        inTab="issue"
      />
    )

    const searchInput = screen.getByPlaceholderText('global.search')
    await user.type(searchInput, 'First')
    
    // Find and click the clear button
    const clearButton = searchInput.parentElement.querySelector('button')
    await user.click(clearButton)

    expect(screen.getByText('First Issue')).toBeInTheDocument()
    expect(screen.getByText('Second Issue')).toBeInTheDocument()
    expect(screen.getByText('Third Issue')).toBeInTheDocument()
  })

  it('changes rows per page when select value changes', async () => {
    const user = userEvent.setup()
    
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={mockData}
        inTab="issue"
      />
    )

    const rowsSelect = screen.getByDisplayValue('5')
    await user.selectOptions(rowsSelect, '10')

    expect(rowsSelect.value).toBe('10')
  })

  it('handles text-to-speech functionality', async () => {
    render(
      <IssueList
        tags={[]}
        ComponentName="Chat"
        data={mockData}
        inTab="ai"
      />
    )

    // Verify that Chat components are rendered with Read buttons
    const readButtons = screen.getAllByText('Read')
    expect(readButtons).toHaveLength(3)
    expect(readButtons[0]).toBeInTheDocument()
  })

  it('displays correct total count', () => {
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={mockData}
        inTab="issue"
      />
    )

    expect(screen.getByText('issue.total')).toBeInTheDocument()
  })

  it('handles pagination correctly', async () => {
    const user = userEvent.setup()
    const largeData = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      body: `Content ${i + 1}`,
      labels: []
    }))
    
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={largeData}
        inTab="issue"
      />
    )

    // Should show first 5 items by default
    expect(screen.getByText('Issue 1')).toBeInTheDocument()
    expect(screen.getByText('Issue 5')).toBeInTheDocument()
    expect(screen.queryByText('Issue 6')).not.toBeInTheDocument()

    // Navigate to page 2
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(screen.getByText('Issue 6')).toBeInTheDocument()
    expect(screen.getByText('Issue 10')).toBeInTheDocument()
    expect(screen.queryByText('Issue 1')).not.toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={[]}
        inTab="issue"
      />
    )

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByTestId('joke-component')).toBeInTheDocument()
  })

  it('handles undefined data gracefully', () => {
    render(
      <IssueList
        tags={[]}
        ComponentName="Issue"
        data={undefined}
        inTab="issue"
      />
    )

    expect(screen.getByRole('grid')).toBeInTheDocument()
  })
})