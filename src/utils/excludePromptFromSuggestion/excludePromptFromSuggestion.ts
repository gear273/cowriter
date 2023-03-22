/**
 * Exclude the prompt from the suggestion.
 *
 * @param prompt - The prompt to exclude from the suggestion.
 * @param suggestion - The suggestion to exclude the prompt from.
 * @returns The suggestion without the prompt.
 */
export default function excludePromptFromSuggestion(
  prompt: string,
  suggestion: string,
) {
  if (!prompt) {
    return suggestion
  }

  if (!suggestion) {
    return ''
  }

  const lowerPrompt = prompt.toLowerCase()
  const lowerSuggestion = suggestion.toLowerCase()
  let index = 0

  // Iterate over the characters in the lowercased suggestion and compare them with the characters in the lowercased prompt
  for (let i = 0; i < lowerSuggestion.length; i++) {
    const suggestionSubstring = lowerSuggestion.substring(0, i + 1)
    const promptEndSubstring = lowerPrompt.substring(lowerPrompt.length - i - 1)

    if (suggestionSubstring === promptEndSubstring) {
      index = i + 1
    }
  }

  // Return the remaining part of the original suggestion
  return suggestion.substring(index)
}
