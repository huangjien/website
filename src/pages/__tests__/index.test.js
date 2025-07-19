import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../index'
import { useGithubContent } from '../../lib/useGithubContent'
import { useTitle } from 'ahooks'
import { useTranslation } from 'react-i18next'

// Mock dependencies
jest.mock('../../lib/useGithubContent', () => ({
  useGithubContent: jest.fn()
}))

jest.mock('ahooks', () => ({
  useTitle: jest.fn()
}))

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}))

// Mock IssueList component
jest.mock('../../components/IssueList', () => ({
  IssueList: ({ tags, data, ComponentName, inTab }) => (
    <div 
      data-testid="issue-list"
      data-tags={JSON.stringify(tags)}
      data-data={JSON.stringify(data)}
      data-component-name={ComponentName}
      data-in-tab={inTab}
    >
      Issue List Component
    </div>
  )
}))

describe('Home page', () => {
  const mockT = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    useTranslation.mockReturnValue({
      t: mockT
    })
    
    mockT.mockImplementation((key) => {
      const translations = {
        'header.home': 'Home'
      }
      return translations[key] || key
    })
  })

  it('should render without crashing', () => {
    useGithubContent.mockReturnValue({
      tags: ['blog', 'tech'],
      issues: [{ id: 1, title: 'Test Issue' }]
    })

    render(<Home />)
    
    expect(screen.getByTestId('issue-list')).toBeInTheDocument()
  })

  it('should set page title using useTitle hook', () => {
    useGithubContent.mockReturnValue({
      tags: [],
      issues: []
    })

    render(<Home />)
    
    expect(useTitle).toHaveBeenCalledWith('Home')
    expect(mockT).toHaveBeenCalledWith('header.home')
  })

  it('should pass correct props to IssueList component', () => {
    const mockTags = ['blog', 'tech', 'personal']
    const mockIssues = [
      { id: 1, title: 'First Issue', body: 'Content 1' },
      { id: 2, title: 'Second Issue', body: 'Content 2' }
    ]
    
    useGithubContent.mockReturnValue({
      tags: mockTags,
      issues: mockIssues
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toHaveAttribute('data-tags', JSON.stringify(mockTags))
    expect(issueList).toHaveAttribute('data-data', JSON.stringify(mockIssues))
    expect(issueList).toHaveAttribute('data-component-name', 'Issue')
    expect(issueList).toHaveAttribute('data-in-tab', 'issue')
  })

  it('should handle empty tags and issues', () => {
    useGithubContent.mockReturnValue({
      tags: [],
      issues: []
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toHaveAttribute('data-tags', '[]')
    expect(issueList).toHaveAttribute('data-data', '[]')
  })

  it('should handle null tags and issues', () => {
    useGithubContent.mockReturnValue({
      tags: null,
      issues: null
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toHaveAttribute('data-tags', 'null')
    expect(issueList).toHaveAttribute('data-data', 'null')
  })

  it('should handle undefined tags and issues', () => {
    useGithubContent.mockReturnValue({
      tags: undefined,
      issues: undefined
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toBeInTheDocument()
  })

  it('should call useGithubContent hook', () => {
    useGithubContent.mockReturnValue({
      tags: ['test'],
      issues: [{ id: 1 }]
    })

    render(<Home />)
    
    expect(useGithubContent).toHaveBeenCalled()
  })

  it('should call useTranslation hook', () => {
    useGithubContent.mockReturnValue({
      tags: [],
      issues: []
    })

    render(<Home />)
    
    expect(useTranslation).toHaveBeenCalled()
  })

  it('should pass static props correctly to IssueList', () => {
    useGithubContent.mockReturnValue({
      tags: ['tag1'],
      issues: [{ id: 1 }]
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toHaveAttribute('data-component-name', 'Issue')
    expect(issueList).toHaveAttribute('data-in-tab', 'issue')
  })

  it('should handle large datasets', () => {
    const largeTags = Array.from({ length: 50 }, (_, i) => `tag${i}`)
    const largeIssues = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Issue ${i}`,
      body: `Content for issue ${i}`
    }))
    
    useGithubContent.mockReturnValue({
      tags: largeTags,
      issues: largeIssues
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toBeInTheDocument()
    expect(issueList).toHaveAttribute('data-tags', JSON.stringify(largeTags))
    expect(issueList).toHaveAttribute('data-data', JSON.stringify(largeIssues))
  })

  it('should handle complex issue objects', () => {
    const complexIssues = [
      {
        id: 1,
        title: 'Complex Issue',
        body: 'Issue with **markdown** and [links](https://example.com)',
        labels: [{ name: 'bug' }, { name: 'enhancement' }],
        user: { login: 'testuser' },
        created_at: '2023-01-01T00:00:00Z'
      }
    ]
    
    useGithubContent.mockReturnValue({
      tags: ['bug', 'enhancement'],
      issues: complexIssues
    })

    render(<Home />)
    
    const issueList = screen.getByTestId('issue-list')
    expect(issueList).toHaveAttribute('data-data', JSON.stringify(complexIssues))
  })
})