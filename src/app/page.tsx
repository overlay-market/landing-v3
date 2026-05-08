import { HashRouteGate } from "@/components/hash-route-gate"

const LINKS = {
  documentation: "https://docs.overlay.market/",
  whitepaperV1: "https://redrct.overlay.market/whitepaper",
  discord: "https://redrct.overlay.market/discord",
  twitter: "https://twitter.com/OverlayProtocol",
  launchApp: "https://app.overlay.market",
  telegram: "https://t.me/overlay_protocol",
  listingApplication: "https://forms.gle/aWcpf49GaoVPMomg7",
  markets: "https://app.overlay.market",
  trade: "https://app.overlay.market/trade",
} as const

const externalLinkProps = {
  rel: "noopener noreferrer",
  target: "_blank",
}

const navItems = [
  { label: "Markets", href: LINKS.markets },
  { label: "Trade", href: LINKS.trade },
  { label: "Docs", href: LINKS.documentation },
  { label: "Listing Application", href: LINKS.listingApplication },
]

const footerLinks = [
  { label: "Markets", href: LINKS.markets },
  { label: "Trade", href: LINKS.trade },
  { label: "Docs", href: LINKS.documentation },
  { label: "Listing Application", href: LINKS.listingApplication },
  { label: "Whitepaper", href: LINKS.whitepaperV1 },
  { label: "Twitter", href: LINKS.twitter },
  { label: "Telegram", href: LINKS.telegram },
  { label: "Discord", href: LINKS.discord },
]

const auditors = [
  {
    name: "Spearbit DAO",
    completedAuditHref:
      "https://github.com/overlay-market/v1-core/blob/main/audits/spearbit/audit.pdf",
    externalLinkText: "Spearbit DAO Audit",
  },
  {
    name: "Least Authority",
    completedAuditHref:
      "https://github.com/overlay-market/v1-core/blob/main/audits/leastauthority/audit.pdf",
    externalLinkText: "Least Authority Audit",
  },
  {
    name: "Trail of Bits",
    completedAuditHref:
      "https://github.com/overlay-market/v1-core/blob/main/audits/trailofbits/audit.pdf",
    externalLinkText: "Trail of Bits Audit",
  },
  {
    name: "Nethermind",
    completedAuditHref:
      "https://github.com/overlay-market/v1-shiva/blob/main/audits/nethermind/audit.pdf",
    externalLinkText: "Nethermind Audit",
  },
]

export default function Home() {
  return (
    <HashRouteGate>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-background/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <span className="font-headline-md text-2xl font-bold tracking-tighter text-primary">
            OVERLAY
          </span>
          <div className="hidden md:flex gap-5 lg:gap-8">
            {navItems.map((item) => (
              <a
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-200 whitespace-nowrap"
                href={item.href}
                key={item.label}
                {...externalLinkProps}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a
            className="inline-flex shrink-0 items-center justify-center bg-primary text-on-primary font-label-caps text-label-caps px-4 sm:px-5 py-2.5 rounded uppercase tracking-wider hover:bg-primary-container transition-colors duration-200"
            href={LINKS.launchApp}
            {...externalLinkProps}
          >
            Launch App
          </a>
        </div>
      </nav>
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        {/* 1. Terminal Hero */}
        <section className="max-w-container-max mx-auto px-6 pt-16 pb-14 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-overlay opacity-30 pointer-events-none z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-7 md:space-y-8 z-10">
              <h1 className="font-headline-xl text-5xl md:text-6xl text-secondary max-w-2xl leading-tight text-balance">
                PERPS FOR THE LONG TAIL.
              </h1>
              <p className="font-body-md text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                Access perpetual markets for emerging tokens, pre-CEX assets, and
                narrative-driven assets that traditional venues can&apos;t support.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 md:pt-4">
                <a
                  className="inline-flex items-center justify-center bg-secondary text-background font-label-caps text-label-caps px-6 py-3.5 rounded uppercase tracking-wider hover:bg-on-background transition-colors duration-200"
                  href={LINKS.launchApp}
                  {...externalLinkProps}
                >
                  Launch App
                </a>
                <a
                  className="inline-flex items-center justify-center bg-transparent border border-primary/40 text-primary font-label-caps text-label-caps px-6 py-3.5 rounded uppercase tracking-wider hover:bg-primary/10 transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  href={LINKS.listingApplication}
                  {...externalLinkProps}
                >
                  Request a Market
                </a>
              </div>
            </div>
            <div className="relative z-10 mt-6 lg:mt-0">
              <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-1 shadow-2xl relative scanline-effect backdrop-blur-md">
                <div className="bg-surface-container-highest rounded-t-lg flex items-center justify-between gap-4 p-3 border-b border-outline-variant/50">
                  <div className="flex gap-2.5">
                    <button
                      aria-label="Close terminal"
                      className="group/close relative h-3 w-3 cursor-help appearance-none rounded-full border-0 bg-error p-0"
                      title="Nice try, but liquidity never sleeps."
                      type="button"
                    >
                      <span className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-48 rounded border border-error/50 bg-surface-container-high p-2 text-left opacity-0 shadow-xl transition-opacity duration-200 group-hover/close:opacity-100 group-focus/close:opacity-100 group-focus-visible/close:opacity-100">
                        <span className="font-data-md text-[10px] leading-tight text-error uppercase">
                          Error 403: Access Denied.
                          <br /> You&apos;re here forever.
                        </span>
                      </span>
                    </button>
                    <div className="w-3 h-3 rounded-full bg-secondary-container" />
                    <div className="w-3 h-3 rounded-full bg-surface-container-highest border border-outline-variant" />
                  </div>
                  <span className="font-data-md text-[10px] sm:text-xs text-on-surface-variant tracking-widest whitespace-nowrap">
                    OVL // TERMINAL_V2
                  </span>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-h-[420px] sm:min-h-0 sm:h-[340px] overflow-hidden bg-[url('https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center rounded-b-lg">
                  <div className="min-w-0 bg-background/90 backdrop-blur-sm p-5 border border-outline-variant/50 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2 tracking-widest">
                        ASSET
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="font-data-lg text-xl md:text-2xl text-primary break-words">
                          $EMERGING-ASSET
                        </span>
                        <span className="w-fit px-1.5 py-0.5 border border-primary/30 text-[8px] font-label-caps text-primary rounded bg-primary/5 uppercase">
                          Thin Liquidity
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2 tracking-widest">
                        PRICE
                      </span>
                      <span className="font-data-lg text-xl md:text-2xl text-secondary">
                        0.0042
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 bg-background/90 backdrop-blur-sm p-5 border border-outline-variant/50 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2 tracking-widest">
                        FUNDING
                      </span>
                      <span className="font-data-lg text-xl md:text-2xl text-secondary-container">
                        +0.01%
                      </span>
                    </div>
                    <div>
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2 tracking-widest">
                        24H VOL
                      </span>
                      <span className="font-data-lg text-xl md:text-2xl text-secondary">
                        300M+
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 2. The Liquidity Gap */}
        <section className="max-w-container-max mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="font-headline-md text-4xl md:text-5xl text-secondary text-balance">
              The Liquidity Gap
            </h2>
            <p className="font-body-md text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Traditional DEXs &amp; CEXs only support top-tier assets due to
              liquidity constraints. Overlay bridges the gap.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-outline-variant/50 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-surface-container-lowest p-8 md:p-12 border-b md:border-b-0 md:border-r border-outline-variant/50">
              <h3 className="font-label-caps text-xs text-on-surface-variant mb-8 uppercase tracking-[0.2em]">
                Traditional Perps
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-outline">
                    close
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Require massive liquidity pools
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-outline">
                    close
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Limited to high-cap majors
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-outline">
                    close
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Vulnerable to oracle manipulation on thin books
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-surface-container-low p-8 md:p-12 relative scanline-effect">
              <h3 className="font-label-caps text-xs text-primary mb-8 uppercase tracking-[0.2em]">
                Overlay Long-Tail
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">
                    check
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Zero liquidity requirements
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">
                    check
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Support for any verifiable data feed
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">
                    check
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Dynamic risk engine mitigates volatility
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">
                    check
                  </span>
                  <span className="font-body-md text-base text-on-surface">
                    Revenue-share for protocols launching markets
                  </span>
                </li>
              </ul>
              <div className="mt-10 md:mt-12 pt-8 border-t border-primary/20">
                <p className="font-body-md text-sm text-on-surface-variant mb-4">
                  Don&apos;t see the market you want?
                </p>
                <a
                  className="flex items-center gap-3 text-primary font-label-caps text-[11px] uppercase tracking-widest hover:gap-5 transition-all duration-300"
                  href={LINKS.listingApplication}
                  {...externalLinkProps}
                >
                  <span>Initiate Community Request</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* Backed By Section */}
        <section className="max-w-container-max mx-auto px-6 py-16 md:py-24">
          <div className="border-t border-b border-outline-variant/30 py-16 md:py-20">
            <div className="flex flex-col items-center space-y-12 md:space-y-16">
              <span className="font-label-caps text-xs text-on-surface-variant tracking-[0.3em] uppercase">
                Backed By
              </span>
              <div className="grid w-full max-w-5xl grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 items-center opacity-70 hover:opacity-100 transition-opacity duration-500 mx-auto">
                <div className="flex flex-col items-center justify-center grayscale contrast-125">
                  <span className="font-headline-md text-lg md:text-xl text-secondary font-bold tracking-tighter uppercase">
                    POLYCHAIN
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center grayscale contrast-125">
                  <span className="font-headline-md text-lg md:text-xl text-secondary font-bold tracking-tighter uppercase">
                    ParaFi
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center grayscale contrast-125">
                  <span className="font-headline-md text-lg md:text-xl text-secondary font-bold tracking-tighter uppercase">
                    1KX
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center grayscale contrast-125">
                  <span className="font-headline-md text-lg md:text-xl text-secondary font-bold tracking-tighter uppercase">
                    FALCONX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Footer Banner / CTA */}
        <section className="max-w-container-max mx-auto px-6 py-16 md:py-24">
          <div className="relative p-8 sm:p-12 md:p-20 rounded-2xl overflow-hidden border border-outline-variant/50 bg-surface-container-lowest shadow-2xl group">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary-container/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 md:gap-12 lg:gap-24">
              <div className="max-w-2xl space-y-6">
                <span className="font-label-caps text-xs text-primary tracking-[0.2em] block uppercase">
                  Infrastructure for Ecosystems
                </span>
                <h2 className="font-headline-xl text-4xl sm:text-5xl md:text-6xl text-secondary leading-tight text-balance">
                  EXPAND YOUR <br />
                  LIQUIDITY HORIZON.
                </h2>
                <p className="font-body-md text-lg text-on-surface-variant leading-relaxed">
                  Builders and protocols: Launch permissionless perpetual markets
                  for your native tokens or niche data feeds. We provide the risk
                  engine, you provide the vision.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-auto shrink-0">
                <a
                  className="inline-flex w-full items-center justify-center bg-primary text-on-primary font-label-caps text-xs px-10 py-4 rounded uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_30px_rgba(0,240,255,0.2)] text-center"
                  href={LINKS.listingApplication}
                  {...externalLinkProps}
                >
                  Request a Market
                </a>
                <a
                  className="inline-flex w-full items-center justify-center border border-outline-variant text-on-surface-variant font-label-caps text-xs px-10 py-4 rounded uppercase tracking-widest hover:bg-surface-container-high transition-colors text-center"
                  href={LINKS.documentation}
                  {...externalLinkProps}
                >
                  View Integration Docs
                </a>
              </div>
            </div>
            <div className="absolute top-0 right-0 hidden sm:block p-6">
              <span className="font-data-md text-[10px] text-outline-variant/50 tracking-widest">
                {"// SYSTEM_EXPANSION_READY"}
              </span>
            </div>
          </div>
        </section>
        {/* Audited By Section */}
        <section className="max-w-container-max mx-auto px-6 py-16 md:py-24">
          <div className="border-t border-outline-variant/30 py-16 md:py-20">
            <div className="flex flex-col items-center space-y-12 md:space-y-16">
              <span className="font-label-caps text-xs text-on-surface-variant tracking-[0.3em] uppercase">
                Audited By
              </span>
              <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 items-center opacity-70 hover:opacity-100 transition-opacity duration-500">
                {auditors.map((auditor) => (
                  <a
                    aria-label={auditor.externalLinkText}
                    className="flex min-h-10 flex-col items-center justify-center grayscale contrast-125 hover:grayscale-0 transition-all"
                    href={auditor.completedAuditHref}
                    key={auditor.name}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="font-headline-md text-xl md:text-2xl text-secondary font-bold tracking-tighter text-center uppercase leading-tight">
                      {auditor.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-10 md:py-12 px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="text-center md:text-left">
          <span className="font-headline-md text-xl font-bold text-on-surface block mb-3">
            OVERLAY
          </span>
          <p className="font-body-md text-sm text-on-surface-variant">
            HIGH-STAKES TRADING INVOLVES RISK.
          </p>
        </div>
        <div className="flex max-w-4xl flex-wrap justify-center md:justify-end gap-x-6 gap-y-4">
          {footerLinks.map((item) => (
            <a
              className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-wider"
              href={item.href}
              key={item.label}
              {...externalLinkProps}
            >
              {item.label}
            </a>
          ))}
        </div>
      </footer>
    </HashRouteGate>
  )
}
