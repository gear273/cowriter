import { ActivityIndicator } from '@/components/ActivityIndicator'
import { capitalizeString } from '@/utils/capitalizeString'
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
  const editableTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const textAreaWithSuggestionRef = useRef<HTMLTextAreaElement>(null)
  const client = useNhostClient()
  const [prompt, setPrompt] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [suggestion, setSuggestion] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const textWithSuggestion = mergePromptWithSuggestion(prompt, suggestion)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChange = useCallback(
    debounce(async (newPrompt: string) => {
      setError('')

      if (!newPrompt && !newPrompt.endsWith(' ')) {
        setSuggestion('')

        return
      }

      setLoading(true)

      try {
        const { res, error } = await client.functions.call<{
          suggestion: string
        }>('/autocomplete', { prompt: newPrompt })

        if (error) {
          console.error(error)
          setError(error.message)

          return
        }

        const suggestion = res?.data?.suggestion || ''
        const trimmedNewPrompt = newPrompt.trim()

        if (
          trimmedNewPrompt.endsWith('.') ||
          trimmedNewPrompt.endsWith('!') ||
          trimmedNewPrompt.endsWith('?')
        ) {
          setSuggestion(capitalizeString(suggestion))
          return
        }

        setSuggestion(suggestion)
      } catch (error) {
        console.error(error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
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

    const updatedSuggestion = excludePromptFromSuggestion(
      updatedValue,
      suggestion,
    )

    if (!suggestion.startsWith(updatedValue.charAt(updatedValue.length - 1))) {
      setSuggestion('')

      return
    }

    setSuggestion(updatedSuggestion)
  }

  function acceptSuggestion() {
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
      setSuggestion('')

      return
    }

    const isSuggestionTerminated = isSentence(suggestion)

    setText(
      `${prompt.endsWith(' ') ? prompt : `${prompt} `}${
        isSuggestionTerminated ? suggestion : `${suggestion}.`
      }`.trim(),
    )

    setSuggestion('')
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
          ref={textAreaWithSuggestionRef}
          className={twMerge(
            'absolute top-0 left-0 bottom-0 right-0 p-3',
            'resize-none rounded-md',
            'bg-transparent text-white text-opacity-50 focus:outline-none',
            className,
          )}
          readOnly
          {...props}
          value={textWithSuggestion}
        />

        <textarea
          ref={mergeRefs([ref, editableTextAreaRef])}
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

            textAreaWithSuggestionRef.current?.scrollTo({
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
              editableTextAreaRef.current?.focus()
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

      {error && <p className="text-red-500">Error: {error}</p>}

      {loading && (
        <ActivityIndicator label="Fetching suggestion..." delay={500} />
      )}
    </div>
  )
}
export default forwardRef(CowriterTextArea)
