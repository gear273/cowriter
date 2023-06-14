import { CodeBlock } from '@/components/CodeBlock'
import { CowriterTextArea } from '@/components/CowriterTextArea'
import Head from 'next/head'

export default function Home() {
  return (
    <div className="py-8">
      <Head>
        <title>Cowriter</title>
      </Head>

      <div className="mx-auto grid w-full max-w-7xl grid-flow-row gap-5 px-4">
        <section className="grid grid-flow-row gap-2">
          <h1 className="text-3xl font-semibold">Cowriter</h1>

          <p>Use the text area below to test Cowriter&apos;s capabilities.</p>

          <p className="opacity-70">
            ❗ <strong>Note</strong>: Suggestions are returned by a mock API
            temporarily and are not guaranteed to be grammatically correct.
          </p>
        </section>

        <section className="grid grid-flow-row gap-2">
          <h2 className="text-xl font-semibold">User Manual</h2>

          <ul className="grid list-disc grid-flow-row gap-2 pl-6">
            <li>
              If you are on desktop, press <CodeBlock>Tab</CodeBlock> to accept
              the current suggestion.
            </li>
            <li>
              If you are on mobile, tap the <CodeBlock>Accept</CodeBlock> button
              to accept the current suggestion.
            </li>
          </ul>
        </section>

        <CowriterTextArea className="w-full" />
      </div>
    </div>
  )
}
