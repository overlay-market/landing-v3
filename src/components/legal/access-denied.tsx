export default function AccessDenied() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1b2131] px-4 py-12 text-white">
      <section className="mx-auto flex w-full max-w-[400px] flex-col items-center rounded-lg border border-[#71ceff] bg-[#1b2131] px-4 pt-4 pb-6 shadow-[0_0_12px_#5b60a4]">
        <h1 className="text-center text-xl font-bold leading-snug">
          Service Not Available In Your Region
        </h1>
        <p className="mt-3 text-center text-base leading-relaxed">
          For compliance reasons, service is not available in your region.
        </p>
        <p className="mt-3 text-center text-base leading-relaxed">
          Use of Tor, VPN, proxies or other means to circumvent this restriction is a violation of
          our{" "}
          <a
            className="text-[#12b4ff]"
            href="https://overlay.market/#/tos"
            rel="noopener noreferrer"
            target="_blank"
          >
            Terms of Service.
          </a>
        </p>
      </section>
    </main>
  )
}
