import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import "highlight.js/styles/github-dark.css";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
