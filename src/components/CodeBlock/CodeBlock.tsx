import { DetailedHTMLProps, HTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export interface CodeBlockProps
  extends DetailedHTMLProps<HTMLProps<HTMLDivElement>, HTMLDivElement> {}

export default function CodeBlock({
  className,
  children,
  ...props
}: CodeBlockProps) {
  return (
    <code
      className={twMerge(
        'rounded-md bg-gray-700 p-1 text-xs text-white text-opacity-80',
        className,
      )}
    >
      {children}
    </code>
  )
}
