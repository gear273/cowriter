import { ActivityIndicator } from '@/components/ActivityIndicator'
import { useSuggestion } from '@/hooks/useSuggestion'
import { useTouchDevice } from '@/hooks/useTouchDevice'
import { excludePromptFromSuggestion } from '@/utils/excludePromptFromSuggestion'
import { generateText } from '@/utils/generateText'
import { mergePromptWithSuggestion } from '@/utils/mergePromptWithSuggestion'
import debounce from 'lodash.debounce'
import {
  ChangeEvent,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  TextareaHTMLAttributes,
  UIEvent,
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
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const suggestionRef = useRef<HTMLTextAreaElement>(null)

  const isTouchDevice = useTouchDevice()

  const [suggestionAccepted, setSuggestionAccepted] = useState<boolean>(false)

  // the latest prompt
  const [prompt, setPrompt] = useState<string>('')

  // the text containing the latest prompt and the suggestion
  const [text, setText] = useState<string>('')

  const {
    data: fetchedSuggestion,
    error,
    isFetching,
    refetch: refetchSuggestion,
  } = useSuggestion(prompt)

  // currently active suggestion or an empty string if the current suggestion
  // is already accepted
  const suggestion = !suggestionAccepted
    ? excludePromptFromSuggestion(prompt, fetchedSuggestion)
    : ''

  // the prompt + suggestion if the suggestion is not accepted, otherwise
  // the complete text
  const promptWithSuggestion = !suggestionAccepted
    ? mergePromptWithSuggestion(prompt, suggestion)
    : text

  useEffect(() => {
    if (!suggestion || !promptRef.current) {
      return
    }
  }, [suggestion])

  const createDebouncedChange = useCallback(
    () =>
      debounce(async (newPrompt: string) => {
        if (!newPrompt && !newPrompt.endsWith(' ')) {
          setSuggestionAccepted(true)

          return
        }

        try {
          await refetchSuggestion()

          setSuggestionAccepted(false)
        } catch (error) {
          console.error(error)
        }
      }, debounceTime),
    [debounceTime, refetchSuggestion],
  )

  useEffect(() => {
    if (prompt === '') {
      return
    }

    const debouncedChange = createDebouncedChange()

    debouncedChange(prompt)

    return () => {
      debouncedChange.cancel()
    }
  }, [createDebouncedChange, prompt])

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event)

    const updatedValue = event.target.value

    setText(updatedValue)
    setPrompt(updatedValue)

    // if the user is typing the same character that the suggestion starts with,
    // don't hide the suggestion by marking it as accepted
    if (suggestion?.startsWith(updatedValue.charAt(updatedValue.length - 1))) {
      return
    }

    setSuggestionAccepted(true)
  }

  function acceptSuggestion() {
    if (!suggestion) {
      return
    }

    setText(generateText(prompt, suggestion))
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

  function synchronizeScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (!(event.target instanceof HTMLTextAreaElement)) {
      return
    }

    // sync scroll positions
    suggestionRef.current?.scrollTo({
      top: promptRef.current?.scrollTop,
    })
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
          onScroll={synchronizeScroll}
          {...props}
          value={text}
          placeholder="Enter your text here..."
          aria-label="Prompt"
        />
      </div>

      <div className="grid grid-flow-col content-between items-center">
        {isFetching && (
          <ActivityIndicator label="Fetching suggestion..." delay={500} />
        )}

        {error && !isFetching && (
          <p className="text-xs text-red-500">
            Error: {error?.message || 'Unknown error'}
          </p>
        )}

        {suggestion && isTouchDevice && (
          <button
            className="grid grid-flow-col items-center gap-2 justify-self-end rounded-md bg-blue-500 p-2 text-sm hover:bg-blue-600 motion-safe:transition-colors"
            onClick={() => {
              acceptSuggestion()
              promptRef.current?.focus()
            }}
            aria-label="Accept"
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
    </div>
  )
}
export default forwardRef(CowriterTextArea)
