import { streamText, convertToCoreMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Chat streaming endpoint using Vercel AI SDK (Pages Router, Node runtime)
 * Compatible with @ai-sdk/react useChat hook (UI Message protocol)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, model, temperature, system } = req.body ?? {};

    const coreMessages = convertToCoreMessages(messages ?? []);

    const result = await streamText({
      model: openai(model || 'gpt-4o-mini'),
      messages: coreMessages,
      temperature: typeof temperature === 'number' ? temperature : undefined,
      system: typeof system === 'string' ? system : undefined,
    });

    // Stream UI message events to the client response
    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error('[api/chat] streaming error', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI stream failed' });
    }
  }
}