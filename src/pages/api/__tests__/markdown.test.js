import handler from '../markdown'
import { createMocks } from 'node-mocks-http'

// Mock fetch globally
global.fetch = jest.fn()

// Mock environment variables
process.env.GITHUB_TOKEN = 'test-token'

describe('/api/markdown', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should convert markdown text to HTML successfully', async () => {
    const mockHtml = '<h1>Hello World</h1>\n<p>This is a test.</p>'
    const markdownText = '# Hello World\nThis is a test.'

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
      ok: true
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/markdown',
      {
        method: 'POST',
        headers: {
          Authorization: 'token test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: markdownText })
      }
    )
    expect(res._getStatusCode()).toBe(200)
    expect(res._getData()).toBe(mockHtml)
  })

  it('should handle empty markdown text', async () => {
    const mockHtml = ''
    const markdownText = ''

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
      ok: true
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/markdown',
      {
        method: 'POST',
        headers: {
          Authorization: 'token test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: {} })
      }
    )
    expect(res._getStatusCode()).toBe(200)
    expect(res._getData()).toBe(mockHtml)
  })

  it('should handle complex markdown with code blocks', async () => {
    const markdownText = `# Code Example\n\n\`\`\`javascript\nconsole.log('Hello World');\n\`\`\``
    const mockHtml = '<h1>Code Example</h1>\n<pre><code class="language-javascript">console.log(\'Hello World\');\n</code></pre>'

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
      ok: true
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/markdown',
      {
        method: 'POST',
        headers: {
          Authorization: 'token test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: markdownText })
      }
    )
    expect(res._getStatusCode()).toBe(200)
    expect(res._getData()).toBe(mockHtml)
  })

  it('should handle GitHub API errors', async () => {
    const markdownText = '# Test'

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'GitHub API Error' })
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(403)
    expect(JSON.parse(res._getData())).toEqual({ error: 'GitHub API Error' })
  })

  it('should handle network errors', async () => {
    const markdownText = '# Test'
    const mockError = new Error('Network error')

    fetch.mockRejectedValueOnce(mockError)

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({ error: 'Network error' })
  })

  it('should handle missing GitHub token', async () => {
    // Temporarily remove GitHub token
    const originalToken = process.env.GITHUB_TOKEN
    delete process.env.GITHUB_TOKEN

    const markdownText = '# Test'
    const mockHtml = '<h1>Test</h1>'

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
      ok: true
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/markdown',
      {
        method: 'POST',
        headers: {
          Authorization: 'token undefined',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: markdownText })
      }
    )

    // Restore GitHub token
    process.env.GITHUB_TOKEN = originalToken
  })

  it('should handle special characters in markdown', async () => {
    const markdownText = '# Test with émojis 🚀 and spëcial chars'
    const mockHtml = '<h1>Test with émojis 🚀 and spëcial chars</h1>'

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
      ok: true
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: markdownText
    })

    await handler(req, res)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/markdown',
      {
        method: 'POST',
        headers: {
          Authorization: 'token test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: markdownText })
      }
    )
    expect(res._getStatusCode()).toBe(200)
    expect(res._getData()).toBe(mockHtml)
  })
})