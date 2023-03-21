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
  const textWithSuggestion = mergePromptWithSuggestion(prompt, suggestion);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChange = useCallback(
    debounce(async (newPrompt: string) => {
      if (!newPrompt) {
        setSuggestion("");

        return;
      }

      const { res, error } = await client.functions.call<{
        suggestion: string;
      }>("/autocomplete", { prompt: newPrompt });

      if (error) {
        console.error(error);

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
    }, debounceTime),
    [client.functions, debounceTime]
  );

  useEffect(() => {
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

    if (event.key === "Tab") {
      event.preventDefault();

      // TODO: Rework this to not remove trailing new lines
      // What's needed here is basically the following:
      // 1. We add a period to the prompt if it doesn't end with one (or a question mark or an exclamation mark) and the suggestion starts with a capital letter
      // 2. We add a space after the period
      // 3. We add the suggestion
      // 4. We add a period if the suggestion doesn't end with one (or a question mark or an exclamation mark)
      // 5. We trim the text
      if (suggestion.charAt(0) === suggestion.charAt(0).toUpperCase()) {
        const trimmedPrompt = prompt.trim();
        const promptEndsWithTerminator =
          trimmedPrompt.endsWith(".") ||
          trimmedPrompt.endsWith("!") ||
          trimmedPrompt.endsWith("?");

        setText(
          `${
            !promptEndsWithTerminator ? `${trimmedPrompt}. ` : trimmedPrompt
          } ${suggestion}${
            suggestion.endsWith("!") || suggestion.endsWith("?") ? "" : "."
          }`.trim()
        );
        setSuggestion("");

        return;
      }

      setText(textWithSuggestion);
      setSuggestion("");
    }
  }

  return (
    <div className="relative w-full h-40">
      <textarea
        className={twMerge(
          "absolute top-0 left-0 right-0 bottom-0 resize-none rounded-md",
          "border-2 border-transparent p-2 text-gray-400",
          "focus:outline-none"
        )}
        readOnly
        {...props}
        value={textWithSuggestion}
      />

      <textarea
        ref={ref}
        className={twMerge(
          "absolute top-0 left-0 right-0 rounded-md bottom-0 bg-transparent p-2 resize-none",
          "motion-safe:transition-colors",
          "border-2 border-gray-300",
          "focus:border-blue-500 focus:outline-none",
          className
        )}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
        value={text}
      />
    </div>
  );
}
export default forwardRef(CowriterTextArea);
