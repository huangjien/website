import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'

describe('Error page', () => {
  let ErrorComponent
  let consoleSpy
  const mockReset = jest.fn()
  const mockError = new Error('Test error message')

  beforeAll(async () => {
    // Dynamically import the Error component to avoid module-level execution issues
    const module = await import('../error')
    ErrorComponent = module.default
  })

  beforeEach(() => {
    // Mock console.error for each test
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render without crashing', () => {
    act(() => {
      render(<ErrorComponent error={mockError} reset={mockReset} />)
    })
    
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('should display error message', () => {
    act(() => {
      render(<ErrorComponent error={mockError} reset={mockReset} />)
    })
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Something went wrong!')
  })

  it('should render try again button', () => {
    act(() => {
      render(<ErrorComponent error={mockError} reset={mockReset} />)
    })
    
    const button = screen.getByRole('button', { name: 'Try again' })
    expect(button).toBeInTheDocument()
  })

  it('should call reset function when try again button is clicked', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />)
    
    const button = screen.getByRole('button', { name: 'Try again' })
    fireEvent.click(button)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should log error to console on mount', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />)
    
    expect(console.error).toHaveBeenCalledWith(mockError)
  })

  it('should log new error when error prop changes', () => {
    const { rerender } = render(<ErrorComponent error={mockError} reset={mockReset} />)
    
    const newError = new Error('New error message')
    rerender(<ErrorComponent error={newError} reset={mockReset} />)
    
    expect(console.error).toHaveBeenCalledWith(newError)
    expect(console.error).toHaveBeenCalledTimes(2)
  })

  it('should handle null error', () => {
    render(<ErrorComponent error={null} reset={mockReset} />)
    
    expect(console.error).toHaveBeenCalledWith(null)
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
  })

  it('should handle undefined error', () => {
    render(<ErrorComponent error={undefined} reset={mockReset} />)
    
    expect(console.error).toHaveBeenCalledWith(undefined)
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
  })

  it('should handle string error', () => {
    const stringError = 'String error message'
    render(<ErrorComponent error={stringError} reset={mockReset} />)
    
    expect(console.error).toHaveBeenCalledWith(stringError)
  })

  it('should handle error object with custom properties', () => {
    const customError = {
      message: 'Custom error',
      code: 500,
      stack: 'Error stack trace'
    }
    
    render(<ErrorComponent error={customError} reset={mockReset} />)
    
    expect(console.error).toHaveBeenCalledWith(customError)
  })

  it('should call reset multiple times when button is clicked multiple times', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />)
    
    const button = screen.getByRole('button', { name: 'Try again' })
    
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(mockReset).toHaveBeenCalledTimes(3)
  })

  it('should not call reset when component mounts', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />)
    
    expect(mockReset).not.toHaveBeenCalled()
  })

  it('should have correct HTML structure', () => {
    const { container } = render(<ErrorComponent error={mockError} reset={mockReset} />)
    
    const mainDiv = container.firstChild
    expect(mainDiv.tagName).toBe('DIV')
    
    const heading = mainDiv.querySelector('h2')
    expect(heading).toBeInTheDocument()
    
    const button = mainDiv.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should handle missing reset prop gracefully', () => {
    // This test checks that the component doesn't crash if reset is undefined
    expect(() => {
      render(<ErrorComponent error={mockError} reset={undefined} />)
    }).not.toThrow()
  })

  it('should handle click when reset is not a function', () => {
    render(<ErrorComponent error={mockError} reset="not a function" />)
    
    const button = screen.getByRole('button', { name: 'Try again' })
    
    // Should not throw an error, but won't call reset either
    expect(() => {
      fireEvent.click(button)
    }).not.toThrow()
  })
})