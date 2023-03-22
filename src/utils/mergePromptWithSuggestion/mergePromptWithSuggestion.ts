import { isSentence } from '@/utils/isSentence'

/**
 * Merges the prompt with the suggestion. If the suggestion ends with a question
 * mark or an exclamation mark, no period is added.
 *
 * @param prompt - The prompt to merge with the suggestion.
 * @param suggestion - The suggestion to merge with the prompt.
 * @returns The merged prompt and suggestion.
 */
export default function mergePromptWithSuggestion(
  prompt?: string,
  suggestion?: string,
) {
  if (!prompt) {
    return ''
  }

  if (!suggestion) {
    return prompt
  }

  return `${prompt}${suggestion}${isSentence(suggestion) ? '' : '.'}`
}
