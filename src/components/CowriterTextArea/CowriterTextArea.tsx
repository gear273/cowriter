import { useNhostClient } from "@nhost/nextjs";
import debounce from "lodash.debounce";
import {
  ChangeEvent,
  DetailedHTMLProps,
  KeyboardEvent,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
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

export default function CowriterTextArea({
  className,
  onChange,
  onKeyDown,
  debounceTime = 750,
  ...props
}: CowriterTextAreaProps) {
  const client = useNhostClient();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const debouncedChange = useCallback(
    debounce(async (newPrompt: string) => {
      if (!newPrompt) {
        return;
      }

      const { res, error } = await client.functions.call<{
        suggestion: string;
      }>("/autocomplete", { prompt: newPrompt });

      if (error) {
        console.error(error);

        return;
      }

      setSuggestion(res?.data?.suggestion);
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
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);

    if (event.key === "Tab") {
      event.preventDefault();

      setText((currentPrompt) => `${currentPrompt}${suggestion ?? ""}.`);
      setSuggestion(null);
    }
  }

  return (
    <div>
      <textarea
        ref={ref}
        className={twMerge(
          "border-2 rounded-md resize-none border-gray-300 focus:border-blue-500 focus:outline-none motion-safe:transition-colors p-2",
          className
        )}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
        value={text}
      />

      {suggestion ? <p>Suggestion: {suggestion}</p> : null}
    </div>
  );
}
