/**
 * Normalizes the suggestion by removing leading and trailing newlines and
 * trimming the string.
 *
 * @param suggestion - The suggestion to normalize.
 * @returns The normalized suggestion.
 */
export function normalizeSuggestion(suggestion?: string) {
  if (!suggestion) {
    return null;
  }

  return suggestion
    .replace(/^(\n)+/i, "")
    .replace(/(\n)+/i, "\n")
    .trim();
}

/**
 * Removes the prompt from the suggestion.
 *
 * @param prompt - The prompt that was used to generate the suggestion.
 * @param suggestion - The suggestion to remove the prompt from.
 * @returns The suggestion without the prompt.
 */
export function excludePromptFromSuggestion(
  prompt: string,
  suggestion: string
) {
  const lowerPrompt = prompt.toLowerCase();
  const lowerSuggestion = suggestion.toLowerCase();
  let index = 0;

  // Iterate over the characters in the lowercased suggestion and compare them with the characters in the lowercased prompt
  for (let i = 0; i < lowerSuggestion.length; i++) {
    const suggestionSubstring = lowerSuggestion.substring(0, i + 1);
    const promptEndSubstring = lowerPrompt.substring(
      lowerPrompt.length - i - 1
    );

    if (suggestionSubstring === promptEndSubstring) {
      index = i + 1;
    }
  }

  // Return the remaining part of the original suggestion
  return suggestion.substring(index);
}
