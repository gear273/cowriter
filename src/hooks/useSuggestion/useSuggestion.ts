import { capitalizeString } from '@/utils/capitalizeString'
import { isSentence } from '@/utils/isSentence'
import { useNhostClient } from '@nhost/nextjs'
import { QueryKey, useQuery } from '@tanstack/react-query'

/**
 * Use this hook to get a suggestion for a given prompt. The underlying useQuery
 * hook is disabled by default, so you need to call it manually by using the
 * `refetch` method on the return value.
 *
 * @param prompt - The prompt to get a suggestion for.
 * @returns The suggestion for the given prompt.
 */
export default function useSuggestion(prompt: string) {
  const client = useNhostClient()

  const returnValues = useQuery<string, Error, string, QueryKey>({
    queryKey: ['autocomplete'],
    queryFn: async () => {
      const { res, error } = await client.functions.call<{
        suggestion: string
      }>('/autocomplete', { prompt })
      if (error) {
        throw new Error(error.message)
      }

      const fetchedSuggestion = res?.data?.suggestion || ''

      if (isSentence(prompt)) {
        return capitalizeString(fetchedSuggestion)
      }

      return fetchedSuggestion
    },
    enabled: false,
  })

  return { ...returnValues, data: returnValues.data || '' }
}
