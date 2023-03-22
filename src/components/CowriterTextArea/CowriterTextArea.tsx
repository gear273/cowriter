import { isSentence } from "@/utils/isSentence";
import { useNhostClient } from "@nhost/nextjs";
import debounce from "lodash.debounce";
import {
  ChangeEvent,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import ActivityIndicator from "../ActivityIndicator/ActivityIndicator";

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
  debounceTime?: number;
}

function excludePromptFromSuggestion(prompt: string, suggestion: string) {
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

function mergePromptWithSuggestion(prompt: string, suggestion: string) {
  if (!prompt) {
    return "";
  }

  if (!suggestion) {
    return prompt;
  }

  return `${prompt}${suggestion}${
    suggestion.endsWith("!") || suggestion.endsWith("?") ? "" : "."
  }`;
}

function capitalizeString(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function CowriterTextArea(
  {
    className,
    onChange,
    onKeyDown,
    debounceTime = 750,
    ...props
  }: CowriterTextAreaProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const client = useNhostClient();
  const [prompt, setPrompt] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const textWithSuggestion = mergePromptWithSuggestion(prompt, suggestion);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChange = useCallback(
    debounce(async (newPrompt: string) => {
      setError("");

      if (!newPrompt && !newPrompt.endsWith(" ")) {
        setSuggestion("");

        return;
      }

      setLoading(true);

      try {
        const { res, error } = await client.functions.call<{
          suggestion: string;
        }>("/autocomplete", { prompt: newPrompt });

        if (error) {
          console.error(error);
          setError(error.message);

          return;
        }

        const suggestion = res?.data?.suggestion || "";
        const trimmedNewPrompt = newPrompt.trim();

        if (
          trimmedNewPrompt.endsWith(".") ||
          trimmedNewPrompt.endsWith("!") ||
          trimmedNewPrompt.endsWith("?")
        ) {
          setSuggestion(capitalizeString(suggestion));
          return;
        }

        setSuggestion(suggestion);
      } catch (error) {
        console.error(error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }, debounceTime),
    [client.functions, debounceTime]
  );

  useEffect(() => {
    if (prompt === "") {
      return;
    }

    debouncedChange(prompt);

    return () => {
      debouncedChange.cancel();
    };
  }, [prompt, debouncedChange]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);

    const updatedValue = event.target.value;

    setText(updatedValue);
    setPrompt(updatedValue);

    const updatedSuggestion = excludePromptFromSuggestion(
      updatedValue,
      suggestion
    );

    if (!suggestion.startsWith(updatedValue.charAt(updatedValue.length - 1))) {
      setSuggestion("");

      return;
    }

    setSuggestion(updatedSuggestion);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);

    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    // Suggestion starts with a capital letter
    if (
      isNaN(parseInt(suggestion.charAt(0))) &&
      suggestion.charAt(0) === suggestion.charAt(0).toUpperCase()
    ) {
      const isPromptTerminated = isSentence(prompt);
      const isSuggestionTerminated = isSentence(suggestion);

      setText(
        `${isPromptTerminated ? prompt : `${prompt.trimEnd()}. `}${
          isSuggestionTerminated ? suggestion : `${suggestion}.`
        }`.trim()
      );
      setSuggestion("");

      return;
    }

    const isSuggestionTerminated = isSentence(suggestion);

    setText(
      `${prompt.trimEnd()} ${
        isSuggestionTerminated ? suggestion : `${suggestion}.`
      }`.trim()
    );

    setSuggestion("");
  }

  return (
    <div className="grid grid-flow-row gap-2">
      <div className="relative w-full h-52">
        <textarea
          className={twMerge(
            "absolute top-0 left-0 right-0 bottom-0 resize-none rounded-md",
            "border-2 border-transparent p-3 text-white text-opacity-50 bg-transparent",
            "focus:outline-none",
            className
          )}
          readOnly
          {...props}
          value={textWithSuggestion}
        />

        <textarea
          ref={ref}
          className={twMerge(
            "absolute top-0 left-0 right-0 rounded-md bottom-0 bg-transparent p-3 resize-none",
            "motion-safe:transition-colors",
            "border-2 border-white border-opacity-10 bg-transparent",
            "focus:border-blue-500 focus:outline-none",
            className
          )}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
          value={text}
          placeholder="Enter your text here..."
        />
      </div>

      {error && <p className="text-red-500">Error: {error}</p>}

      {loading && (
        <ActivityIndicator label="Fetching suggestion..." delay={500} />
      )}
    </div>
  );
}
export default forwardRef(CowriterTextArea);
