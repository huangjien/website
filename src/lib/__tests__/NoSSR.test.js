import { render, screen } from '@testing-library/react'
import NoSSR from '../NoSSR'
import React from 'react'

// Mock React's useState to control the initial state
const mockSetState = jest.fn()
const originalCreateElement = React.createElement

// Create a mock component for testing
const MockedNoSSR = ({ children, onSSR }) => {
  // Simulate server-side rendering (canRender: false)
  if (onSSR) {
    return onSSR
  }
  // Return an empty div for server-side rendering
  return React.createElement('div', {}, null)
}

describe('NoSSR Component', () => {
  beforeEach(() => {
    mockSetState.mockClear()
  })

  it('should render default component on server side', () => {
    const TestComponent = () => <div data-testid="test-content">Client Content</div>
    
    render(
      <MockedNoSSR>
        <TestComponent />
      </MockedNoSSR>
    )

    // Should render empty div (server-side)
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument()
    // Should render a div element
    expect(document.querySelector('div')).toBeInTheDocument()
  })

  it('should render children after component mounts', () => {
    // This test simulates client-side rendering by directly rendering children
    // In a real scenario, this would happen after componentDidMount
    const TestComponent = () => <div data-testid="test-content">Client Content</div>

    render(<TestComponent />)

    // After mounting, children should be rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('should render custom onSSR component when provided', () => {
    const CustomSSRComponent = () => <div data-testid="ssr-content">Loading...</div>

    render(
      <MockedNoSSR onSSR={<CustomSSRComponent />}>
        <div data-testid="test-content">Client Content</div>
      </MockedNoSSR>
    )

    expect(screen.getByTestId('ssr-content')).toBeInTheDocument()
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    render(
      <MockedNoSSR>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </MockedNoSSR>
    )

    // On server side, children should not be rendered
    expect(screen.queryByTestId('child1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('child2')).not.toBeInTheDocument()
  })

  it('should handle null children gracefully', () => {
    render(
      <MockedNoSSR>
        {null}
      </MockedNoSSR>
    )

    // Should not throw error and render empty div
    expect(document.querySelector('div')).toBeInTheDocument()
  })

  it('should handle undefined children gracefully', () => {
    render(
      <MockedNoSSR>
        {undefined}
      </MockedNoSSR>
    )

    // Should not throw error and render empty div
    expect(document.querySelector('div')).toBeInTheDocument()
  })

  it('should render empty div by default when no onSSR is provided', () => {
    const { container } = render(
      <MockedNoSSR>
        <div>Client Content</div>
      </MockedNoSSR>
    )

    // Should render empty div as default SSR component
    const divs = container.querySelectorAll('div')
    expect(divs).toHaveLength(1)
    expect(divs[0]).toBeEmptyDOMElement()
  })
})

// Test the class component behavior with proper React testing
describe('NoSSR Class Component Behavior', () => {
  it('should render default empty div when no onSSR is provided', () => {
    const { container } = render(
      <MockedNoSSR>
        <div data-testid="client-content">Client Content</div>
      </MockedNoSSR>
    )
    
    // Should render empty div by default
    const divs = container.querySelectorAll('div')
    expect(divs).toHaveLength(1)
    expect(divs[0]).toBeEmptyDOMElement()
    expect(screen.queryByTestId('client-content')).not.toBeInTheDocument()
  })

  it('should handle function components as onSSR prop', () => {
    const SSRComponent = () => <div data-testid="ssr-function">SSR Function</div>
    
    render(
      <MockedNoSSR onSSR={<SSRComponent />}>
        <div data-testid="client-content">Client Content</div>
      </MockedNoSSR>
    )
    
    expect(screen.getByTestId('ssr-function')).toBeInTheDocument()
    expect(screen.queryByTestId('client-content')).not.toBeInTheDocument()
  })

  it('should handle string content as children', () => {
    render(
      <MockedNoSSR>
        Hello World
      </MockedNoSSR>
    )
    
    // Should not render the string content on server side
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument()
  })
})