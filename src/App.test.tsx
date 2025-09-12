import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the problematic components
vi.mock('@/lib/utils', () => ({
  cn: () => ''
}))

vi.mock('./components/Header', () => ({
  default: () => <nav>Header</nav>
}))

vi.mock('./components/Footer', () => ({
  default: () => <footer>Footer</footer>
}))

vi.mock('./components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => children
}))

// Mock the data service to prevent network requests
vi.mock('./services/dataService', () => ({
  dataService: {
    getCategoryStats: () => Promise.resolve([]),
    getFeaturedTools: () => Promise.resolve([]),
    getPopularTools: () => Promise.resolve([]),
  }
}))

// Import App after mocks
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    
    // Check if the app container is rendered
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders header component', () => {
    render(<App />)
    
    // Check if header is present (assuming it has a navigation role)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})