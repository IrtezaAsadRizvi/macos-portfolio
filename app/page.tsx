import Script from "next/script";

export default function Home() {
  return (
    <main className="m-0 h-screen w-screen overflow-hidden select-none">
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root" className="h-full w-full overflow-hidden select-none" />
      <Script
        id="macos-demo-runtime"
        src="/macos-demo/index.js"
        strategy="afterInteractive"
      />
    </main>
  );
}
