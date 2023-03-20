import "@/styles/globals.css";
import { NhostClient, NhostProvider } from "@nhost/nextjs";
import type { AppProps } from "next/app";

const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
  region: process.env.NEXT_PUBLIC_NHOST_REGION,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NhostProvider nhost={nhost}>
      <Component {...pageProps} />
    </NhostProvider>
  );
}
