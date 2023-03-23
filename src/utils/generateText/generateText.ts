import { isSentence } from '@/utils/isSentence'

/**
 * Generates the text to be displayed in the text area.
 *
 * @param prompt - The prompt to merge with the suggestion.
 * @param suggestion - The suggestion to merge with the prompt.
 * @returns The merged text.
 */
export default function generateText(prompt?: string, suggestion?: string) {
  if (!prompt) {
    return ''
  }

  if (!suggestion) {
    return prompt
  }

  // Scenario #1: Suggestion starts with a capital letter
  if (
    isNaN(parseInt(suggestion.charAt(0))) &&
    suggestion.charAt(0) === suggestion.charAt(0).toUpperCase()
  ) {
    const isPromptTerminated = isSentence(prompt)
    const promptPart = isPromptTerminated ? prompt : `${prompt.trimEnd()}. `

    const isSuggestionTerminated = isSentence(suggestion)
    const suggestionPart = isSuggestionTerminated
      ? suggestion
      : `${suggestion}.`

    return `${promptPart}${suggestionPart}`.trim()
  }

  // Scenario #2: Suggestion starts with a number or a lowercase letter
  const promptPart = prompt.endsWith(' ') ? prompt : `${prompt} `

  const isSuggestionTerminated = isSentence(suggestion)
  const suggestionPart = isSuggestionTerminated ? suggestion : `${suggestion}.`

  return `${promptPart}${suggestionPart}`.trim()
}
