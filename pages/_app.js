import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
     <Head>
        <title>Our Love Story</title>
        <link rel="icon" type="image/png" href="/images/gift.png" />
        <meta name="description" content="A special journey for us" />
      </Head>
      <Component {...pageProps} />
    </>
);
}
