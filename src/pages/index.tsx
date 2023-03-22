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
          Use this text area to test Cowriter&apos;s capabilities:
        </p>

        <CowriterTextArea className="w-full" />
      </div>
    </div>
  );
}
