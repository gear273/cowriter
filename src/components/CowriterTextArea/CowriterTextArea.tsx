import { ActivityIndicator } from '@/components/ActivityIndicator'
import { useSuggestion } from '@/hooks/useSuggestion'
import { excludePromptFromSuggestion } from '@/utils/excludePromptFromSuggestion'
import { isSentence } from '@/utils/isSentence'
import { mergePromptWithSuggestion } from '@/utils/mergePromptWithSuggestion'
import { useNhostClient } from '@nhost/nextjs'
import debounce from 'lodash.debounce'
import {
  ChangeEvent,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { mergeRefs } from 'react-merge-refs'
import { twMerge } from 'tailwind-merge'

export interface CowriterTextAreaProps
  extends DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  /**
   * The time in milliseconds to wait before calling the `onChange` function.
   *
   * @default 750
   */
  debounceTime?: number
}

function CowriterTextArea(
  {
    className,
    onChange,
    onKeyDown,
    debounceTime = 750,
    ...props
  }: CowriterTextAreaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const client = useNhostClient()

  const promptRef = useRef<HTMLTextAreaElement>(null)
  const suggestionRef = useRef<HTMLTextAreaElement>(null)

  const [suggestionAccepted, setSuggestionAccepted] = useState<boolean>(false)

  // the latest prompt
  const [prompt, setPrompt] = useState<string>('')

  // the text containing the latest prompt and the suggestion
  const [text, setText] = useState<string>('')

  const {
    data: fetchedSuggestion,
    error,
    isFetching,
    refetch: refetchAutocomplete,
  } = useSuggestion(prompt)

  // currently active suggestion or an empty string if the current suggestion
  // is already accepted
  const suggestion = !suggestionAccepted
    ? excludePromptFromSuggestion(prompt, fetchedSuggestion)
    : ''

  // the prompt with the suggestion merged
  const promptWithSuggestion = mergePromptWithSuggestion(prompt, suggestion)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChange = useCallback(
    debounce(async (newPrompt: string) => {
      if (!newPrompt && !newPrompt.endsWith(' ')) {
        setSuggestionAccepted(true)

        return
      }

      try {
        await refetchAutocomplete()

        setSuggestionAccepted(false)
      } catch (error) {
        console.error(error)
      }
    }, debounceTime),
    [client.functions, debounceTime],
  )

  useEffect(() => {
    if (prompt === '') {
      return
    }

    debouncedChange(prompt)

    return () => {
      debouncedChange.cancel()
    }
  }, [prompt, debouncedChange])

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event)

    const updatedValue = event.target.value

    setText(updatedValue)
    setPrompt(updatedValue)

    if (suggestion?.startsWith(updatedValue.charAt(updatedValue.length - 1))) {
      return
    }

    setSuggestionAccepted(true)
  }

  function acceptSuggestion() {
    if (!suggestion) {
      return
    }

    // Suggestion starts with a capital letter
    if (
      isNaN(parseInt(suggestion.charAt(0))) &&
      suggestion.charAt(0) === suggestion.charAt(0).toUpperCase()
    ) {
      const isPromptTerminated = isSentence(prompt)
      const isSuggestionTerminated = isSentence(suggestion)

      setText(
        `${isPromptTerminated ? prompt : `${prompt.trimEnd()}. `}${
          isSuggestionTerminated ? suggestion : `${suggestion}.`
        }`.trim(),
      )

      setSuggestionAccepted(true)

      return
    }

    const isSuggestionTerminated = isSentence(suggestion)

    setText(
      `${prompt.endsWith(' ') ? prompt : `${prompt} `}${
        isSuggestionTerminated ? suggestion : `${suggestion}.`
      }`.trim(),
    )

    setSuggestionAccepted(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event)

    if (event.key !== 'Tab') {
      return
    }

    event.preventDefault()
    acceptSuggestion()
  }

  return (
    <div className="grid grid-flow-row gap-2">
      <div className="relative h-64 w-full rounded-md border-2 border-white border-opacity-10 focus-within:border-blue-500">
        <textarea
          ref={suggestionRef}
          className={twMerge(
            'absolute top-0 left-0 bottom-0 right-0 p-3',
            'resize-none rounded-md',
            'bg-transparent text-white text-opacity-50 focus:outline-none',
            className,
          )}
          readOnly
          {...props}
          value={promptWithSuggestion}
        />

        <textarea
          ref={mergeRefs([ref, promptRef])}
          className={twMerge(
            'absolute top-0 left-0 bottom-0 right-0 p-3',
            'resize-none rounded-md',
            'bg-transparent focus:outline-none motion-safe:transition-colors',
            className,
          )}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={(event) => {
            if (!(event.target instanceof HTMLTextAreaElement)) {
              return
            }

            suggestionRef.current?.scrollTo({
              top: event.target.scrollTop,
            })
          }}
          {...props}
          value={text}
          placeholder="Enter your text here..."
        />

        {suggestion && (
          <button
            className="absolute bottom-2 right-2 grid grid-flow-col items-center gap-2 rounded-md bg-blue-500 p-2 text-sm hover:bg-blue-600 motion-safe:transition-colors md:hidden"
            onClick={() => {
              acceptSuggestion()
              promptRef.current?.focus()
            }}
          >
            <svg
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              aria-label="Checkmark"
              className="h-3 w-3"
            >
              <path
                d="m13.5 4.5-7 7L3 8"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Accept
          </button>
        )}
      </div>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {isFetching && (
        <ActivityIndicator label="Fetching suggestion..." delay={500} />
      )}
    </div>
  )
}
export default forwardRef(CowriterTextArea)
