import Link from "next/link"

export const LINKS = {
  home: "/",
  ecosystem: "/ecosystem",
  documentation: "https://docs.overlay.market/",
  whitepaperV1: "https://redrct.overlay.market/whitepaper",
  discord: "https://redrct.overlay.market/discord",
  twitter: "https://twitter.com/OverlayProtocol",
  launchApp: "https://app.overlay.market",
  telegram: "https://t.me/overlay_protocol",
  listingApplication: "https://forms.gle/aWcpf49GaoVPMomg7",
  markets: "https://app.overlay.market",
  communityPools: "https://app.overlay.market/community-pools",
  trade: "https://app.overlay.market/trade",
} as const

export const externalLinkProps = {
  rel: "noopener noreferrer",
  target: "_blank",
} as const

export const backers = ["POLYCHAIN", "ParaFi", "1KX", "FALCONX"] as const

export const auditors = [
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
] as const

type ActiveMarketingPage = "ecosystem"

type MarketingLink = {
  label: string
  href: string
  external?: boolean
  activePage?: ActiveMarketingPage
}

const navItems: MarketingLink[] = [
  { label: "Markets", href: LINKS.markets, external: true },
  { label: "Community Pools", href: LINKS.communityPools, external: true },
  { label: "Ecosystem", href: LINKS.ecosystem, activePage: "ecosystem" },
  { label: "Docs", href: LINKS.documentation, external: true },
  { label: "Listing Application", href: LINKS.listingApplication, external: true },
]

const footerLinks: MarketingLink[] = [
  { label: "Markets", href: LINKS.markets, external: true },
  { label: "Community Pools", href: LINKS.communityPools, external: true },
  { label: "Ecosystem", href: LINKS.ecosystem },
  { label: "Docs", href: LINKS.documentation, external: true },
  { label: "Listing Application", href: LINKS.listingApplication, external: true },
  { label: "Whitepaper", href: LINKS.whitepaperV1, external: true },
  { label: "Twitter", href: LINKS.twitter, external: true },
  { label: "Telegram", href: LINKS.telegram, external: true },
  { label: "Discord", href: LINKS.discord, external: true },
]

function MarketingNavLink({
  activePage,
  item,
}: {
  activePage?: ActiveMarketingPage
  item: MarketingLink
}) {
  const isActive = item.activePage !== undefined && item.activePage === activePage
  const className = [
    "pb-1 font-label-caps text-[0.78rem] font-medium leading-none tracking-[0.1em] transition-colors duration-200 whitespace-nowrap no-underline hover:no-underline",
    isActive
      ? "border-b border-primary text-primary"
      : "border-b-0 text-on-surface-variant/95 hover:text-primary",
  ].join(" ")

  if (item.external) {
    return (
      <a className={className} href={item.href} {...externalLinkProps}>
        {item.label}
      </a>
    )
  }

  return (
    <Link className={className} href={item.href}>
      {item.label}
    </Link>
  )
}

function MarketingFooterLink({ item }: { item: MarketingLink }) {
  const className =
    "font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-wider no-underline hover:no-underline"

  if (item.external) {
    return (
      <a className={className} href={item.href} {...externalLinkProps}>
        {item.label}
      </a>
    )
  }

  return (
    <Link className={className} href={item.href}>
      {item.label}
    </Link>
  )
}

export function MarketingNav({
  activePage,
}: {
  activePage?: ActiveMarketingPage
}) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-background/90 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="flex items-center gap-6 lg:gap-8 min-w-0">
        <Link
          className="font-headline-md text-2xl font-semibold tracking-[-0.03em] text-primary no-underline hover:no-underline"
          href={LINKS.home}
        >
          OVERLAY
        </Link>
        <div className="hidden lg:flex gap-5 xl:gap-8">
          {navItems.map((item) => (
            <MarketingNavLink
              activePage={activePage}
              item={item}
              key={item.label}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <a
          className="inline-flex shrink-0 items-center justify-center bg-primary text-on-primary font-label-caps text-label-caps font-medium px-4 sm:px-5 py-2.5 rounded uppercase tracking-[0.11em] hover:bg-primary-container transition-colors duration-200 no-underline hover:no-underline"
          href={LINKS.launchApp}
          {...externalLinkProps}
        >
          Launch App
        </a>
      </div>
    </nav>
  )
}

export function MarketingFooter() {
  return (
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
          <MarketingFooterLink item={item} key={item.label} />
        ))}
      </div>
    </footer>
  )
}
