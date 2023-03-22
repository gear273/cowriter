import { useEffect, useState } from "react";

export interface ActivityIndicatorProps {
  /**
   * The time in milliseconds to wait before showing the activity indicator.
   *
   * @default 0
   */
  delay?: number;
  /**
   * The label to show next to the activity indicator.
   */
  label?: string;
}

export default function ActivityIndicator({
  delay = 0,
  label,
}: ActivityIndicatorProps) {
  const [showActivityIndicator, setShowActivityIndicator] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowActivityIndicator(true), delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  if (!showActivityIndicator) {
    return null;
  }

  return (
    <div
      className="grid grid-flow-col gap-2 justify-start"
      role="progressbar"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="animate-spin h-4 w-4"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          fill="none"
          strokeWidth="4"
          className="opacity-25"
        />

        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="opacity-50"
        />
      </svg>

      {label && (
        <span className="text-xs text-white text-opacity-50">{label}</span>
      )}
    </div>
  );
}
