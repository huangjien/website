import handler from '../settings'
import { createMocks } from 'node-mocks-http'

// Mock fetch globally
global.fetch = jest.fn()

// Mock environment variables
process.env.GITHUB_REPO = 'https://api.github.com/repos/test/repo'
process.env.GITHUB_TOKEN = 'test-token'

describe('/api/settings', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should return settings data successfully', async () => {
    const mockIssues = [
      {
        id: 1,
        title: 'Test Setting',
        body: 'Test setting content',
        labels: [{ name: 'settings' }]
      }
    ]

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockIssues),
      ok: true
    })

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/test/repo/issues?labels=settings',
      {
        method: 'GET',
        headers: {
          Authorization: 'token test-token',
        },
      }
    )
    expect(res._getStatusCode()).toBe(200)
  })

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Network error')
    mockError.status = 404
    mockError.message = 'Not found'

    fetch.mockRejectedValueOnce(mockError)

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(404)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Not found'
    })
  })

  it('should handle errors without status code', async () => {
    const mockError = new Error('Unknown error')
    // No status property

    fetch.mockRejectedValueOnce(mockError)

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unknown error'
    })
  })

  it('should handle errors without message', async () => {
    const mockError = {}
    // No message or status property

    fetch.mockRejectedValueOnce(mockError)

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Internal Server Error'
    })
  })
})