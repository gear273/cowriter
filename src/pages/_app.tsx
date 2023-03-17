import "@/styles/globals.css";
import { NhostClient, NhostProvider } from "@nhost/nextjs";
import type { AppProps } from "next/app";

const nhost = new NhostClient({
  // subdomain: "hclpiapyemgfkgyyhfov",
  // region: "eu-central-1",
  subdomain: "localhost",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NhostProvider nhost={nhost}>
      <Component {...pageProps} />;
    </NhostProvider>
  );
}
