import { CowriterTextArea } from "@/components/CowriterTextArea";
import Head from "next/head";

export default function Home() {
  return (
    <div className="py-8">
      <Head>
        <title>Cowriter</title>
      </Head>

      <div className="max-w-7xl w-full mx-auto px-4">
        <h1 className="text-2xl font-semibold">Cowriter</h1>

        <p className="my-2">
          Use this text area below to test Cowriter&apos;s capabilities. Press{" "}
          <code className="bg-gray-700 text-white text-opacity-70 rounded-md text-xs p-1">
            Tab
          </code>{" "}
          to add the current suggestion to the text area.
        </p>

        <CowriterTextArea className="w-full" />
      </div>
    </div>
  );
}
