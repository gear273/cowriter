import type { Request, Response } from 'express'
import mockOpenAI from './_mockopenai'
import originalOpenAI from './_openai'
import { excludePromptFromSuggestion, normalizeSuggestion } from './_utils'

const openai = process.env.MOCK_ENABLED === 'true' ? mockOpenAI : originalOpenAI

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN || '*',
  )
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')

  if (req.method !== 'POST' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!req.body?.prompt) {
    return res.status(400).json({ error: 'Missing parameter "prompt"' })
  }

  if (Number.isNaN(req.body.temperature)) {
    return res.status(400).json({ error: 'Invalid parameter "temperature"' })
  }

  try {
    const { data } = await openai.createCompletion({
      model: 'text-davinci-003',
      n: 1,
      max_tokens: 300,
      temperature: req.body.temperature || 0.3,
      stop: '.',
      prompt: req.body.prompt,
      best_of: 3,
    })

    const normalizedSuggestion = normalizeSuggestion(data.choices[0]?.text)
    const nonOverlappingSuggestion = excludePromptFromSuggestion(
      req.body.prompt,
      normalizedSuggestion,
    )

    return res.status(200).json({ suggestion: nonOverlappingSuggestion })
  } catch (error) {
    console.error(error)

    return res
      .status(error?.response?.status || 500)
      .json({ error: error.message })
  }
}
