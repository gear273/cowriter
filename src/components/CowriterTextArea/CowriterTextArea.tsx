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

function mergePromptWithSuggestion(prompt: string, suggestion: string) {
  if (!prompt) {
    return "";
  }

  if (!suggestion) {
    return prompt;
  }

  return `${
    prompt.endsWith(" ") && !suggestion.startsWith(",") ? prompt : `${prompt} `
  }${suggestion}${
    suggestion.endsWith("!") || suggestion.endsWith("?") ? "" : "."
  }`;
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

      setSuggestion(res?.data?.suggestion || "");
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

    setText(event.target.value);
    setPrompt(event.target.value);

    if (
      !suggestion.startsWith(
        event.target.value.charAt(event.target.value.length - 1)
      )
    ) {
      setSuggestion("");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);

    if (event.key === "Tab") {
      event.preventDefault();

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
