import { Suspense } from "react"
import type { Metadata } from "next"

import {
  LINKS,
  MarketingFooter,
  MarketingNav,
  auditors,
  backers,
  externalLinkProps,
} from "@/components/marketing/marketing-chrome"

export const metadata: Metadata = {
  title: "Overlay Ecosystem - Community Pools",
  description:
    "Fund long-tail perpetual markets through Overlay Community Pools and share in launched market trading fees.",
}

const poolMetrics = [
  { label: "Pool Target", value: "$10K" },
  { label: "Fee Share", value: "30%" },
  { label: "Minimum", value: "$0" },
]

const mechanismSteps = [
  {
    icon: "groups",
    title: "Pool fills",
    description: "Community members contribute any amount toward the target.",
  },
  {
    icon: "rocket_launch",
    title: "Market launches",
    description: "Overlay deploys the perps market after funding is complete.",
  },
  {
    icon: "payments",
    title: "Fees accrue",
    description:
      "Each market charges a 0.1% trading fee; contributors receive weekly payouts.",
  },
  {
    icon: "timer",
    title: "Countdown ends",
    description: "Unfilled pools become refundable after the pool window closes.",
  },
]

const roiStats = [
  { volume: "$1M Volume", roi: "3% monthly ROI" },
  { volume: "$10M Volume", roi: "30% monthly ROI" },
  { volume: "$100M Volume", roi: "300% monthly ROI" },
]

const DATA_API_BASE_URL = "https://api.overlay.market/data/api"
const AGGREGATOR_MARKETS_CHAIN_ID = "56"
const BSC_SUBGRAPH_URL =
  "https://api.goldsky.com/api/public/project_clyiptt06ifuv01ul9xiwfj28/subgraphs/overlay-bsc/prod/gn"
const OVL_OHLCV_URL =
  "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x927ae3c2cd88717a1525a55021af9612c3f04583/ohlcv/day"
const MARKET_DATA_TIMEOUT_MS = 8000
const MARKET_FEE_ROW_LIMIT = 4
const MARKET_FEE_LOOKBACK_DAYS = 30
const OVL_DECIMALS = 18
const SUBGRAPH_PAGE_SIZE = 1000
const SECONDS_PER_DAY = 24 * 60 * 60
const BSC_RPC_URL = "https://bsc-dataseed.binance.org/"
const BSC_USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955"
const BALANCE_OF_SELECTOR = "0x70a08231"
const USDT_DECIMALS = 18
const FILL_TOLERANCE_USDT = 0.01
const BSC_RPC_TIMEOUT_MS = 8000

type AggregatorMarketConfig = {
  baseCurrency?: string
  enabled?: boolean
  targetCurrency?: string
  tickerId?: string
}

type MarketChain = {
  aggregatorContract?: AggregatorMarketConfig
  deploymentAddress?: string
  deprecated?: boolean
  disabled?: boolean
}

type DataApiMarket = {
  chains?: MarketChain[]
  marketName?: string
}

type MarketsByChainResponse = Record<string, DataApiMarket[] | undefined>

type EnabledMarket = {
  address: string
  label: string
  ticker: string
}

type FeeEventMarket = {
  position?: {
    market?: {
      id?: string
    }
  }
  timestamp?: string
}

type TradingFeeEvent = FeeEventMarket & {
  feeAmount?: string
}

type LiquidationFeeEvent = FeeEventMarket & {
  transferFeeAmount?: string
}

type MarketFeeEventsGraphqlResponse = {
  data?: {
    builds?: TradingFeeEvent[]
    liquidates?: LiquidationFeeEvent[]
    unwinds?: TradingFeeEvent[]
  }
  errors?: { message?: string }[]
}

type OvlOhlcvResponse = {
  data?: {
    attributes?: {
      ohlcv_list?: [number, number, number, number, number, number][]
    }
  }
}

type MarketFeeRow = {
  feesOvl: number
  feesUsd: number
  market: string
  ticker: string
}

function formatUsdtAmount(amount: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)} USDT`
}

function formatUsdAmount(
  amount: number,
  options: { compact?: boolean; precise?: boolean } = {}
) {
  if (options.precise) {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: 6,
      minimumFractionDigits: 4,
      style: "currency",
    }).format(amount)
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: amount >= 100 ? 0 : 2,
    minimumFractionDigits: amount >= 100 ? 0 : 2,
    notation: options.compact ? "compact" : "standard",
    style: "currency",
  }).format(amount)
}

function formatCompactNumber(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(amount)
}

function formatUtcTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date)
}

function normalizeMarketLabel(label: string) {
  return label.replace(/\s*\/\s*/g, " / ")
}

type MarketFeeTotal = {
  feesOvl: number
  feesUsd: number
}

function parseBigIntUnits(rawAmount: bigint | string, decimals: number) {
  const raw = typeof rawAmount === "bigint" ? rawAmount : BigInt(rawAmount)
  const scale = BigInt(10) ** BigInt(decimals)
  const whole = raw / scale
  const fraction = raw % scale
  const fractionPrecision = BigInt(1_000_000)

  return (
    Number(whole) +
    Number((fraction * fractionPrecision) / scale) / Number(fractionPrecision)
  )
}

function getUtcDayStart(timestamp: number) {
  return Math.floor(timestamp / SECONDS_PER_DAY) * SECONDS_PER_DAY
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(MARKET_DATA_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

async function getEnabledMarkets() {
  const marketsByChain = await fetchJson<MarketsByChainResponse>(
    `${DATA_API_BASE_URL}/markets`
  )
  const bscMarkets = marketsByChain[AGGREGATOR_MARKETS_CHAIN_ID]

  if (!Array.isArray(bscMarkets)) {
    throw new Error("Data API did not return BSC markets")
  }

  return bscMarkets.flatMap((market) => {
    const marketName = market.marketName?.trim()

    return (market.chains || [])
      .filter((chain) => {
        return (
          chain.aggregatorContract?.enabled &&
          !chain.disabled &&
          !chain.deprecated &&
          chain.deploymentAddress
        )
      })
      .map((chain): EnabledMarket => {
        const aggregator = chain.aggregatorContract
        const label =
          marketName ||
          `${aggregator?.baseCurrency || "Market"} / ${
            aggregator?.targetCurrency || "USD"
          }`

        return {
          address: chain.deploymentAddress!.toLowerCase(),
          label: normalizeMarketLabel(label),
          ticker: aggregator?.tickerId || label,
        }
      })
  })
}

async function fetchMarketFeeEventPage(
  markets: EnabledMarket[],
  fromTimestamp: number,
  toTimestamp: number,
  skip: number
) {
  const response = await fetchJson<MarketFeeEventsGraphqlResponse>(
    BSC_SUBGRAPH_URL,
    {
      body: JSON.stringify({
        query: `
          query MarketFees30d(
            $marketIds: [String!]!
            $from: BigInt!
            $to: BigInt!
            $first: Int!
            $skip: Int!
          ) {
            builds(
              first: $first
              skip: $skip
              orderBy: timestamp
              orderDirection: desc
              where: {
                timestamp_gte: $from
                timestamp_lte: $to
                position_: { market_in: $marketIds }
              }
            ) {
              feeAmount
              timestamp
              position {
                market {
                  id
                }
              }
            }
            unwinds(
              first: $first
              skip: $skip
              orderBy: timestamp
              orderDirection: desc
              where: {
                timestamp_gte: $from
                timestamp_lte: $to
                position_: { market_in: $marketIds }
              }
            ) {
              feeAmount
              timestamp
              position {
                market {
                  id
                }
              }
            }
            liquidates(
              first: $first
              skip: $skip
              orderBy: timestamp
              orderDirection: desc
              where: {
                timestamp_gte: $from
                timestamp_lte: $to
                position_: { market_in: $marketIds }
              }
            ) {
              transferFeeAmount
              timestamp
              position {
                market {
                  id
                }
              }
            }
          }
        `,
        variables: {
          first: SUBGRAPH_PAGE_SIZE,
          from: String(fromTimestamp),
          marketIds: markets.map((market) => market.address),
          skip,
          to: String(toTimestamp),
        },
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    }
  )

  if (response.errors?.length) {
    throw new Error(
      response.errors.map((error) => error.message || "GraphQL error").join("; ")
    )
  }

  const builds = response.data?.builds
  const liquidates = response.data?.liquidates
  const unwinds = response.data?.unwinds

  if (
    !Array.isArray(builds) ||
    !Array.isArray(liquidates) ||
    !Array.isArray(unwinds)
  ) {
    throw new Error("Subgraph did not return market fee events")
  }

  return {
    builds,
    liquidates,
    unwinds,
  }
}

async function getOvlUsdPricesByDay() {
  const url = new URL(OVL_OHLCV_URL)
  url.searchParams.set("aggregate", "1")
  url.searchParams.set("limit", String(MARKET_FEE_LOOKBACK_DAYS + 2))
  url.searchParams.set("currency", "usd")
  url.searchParams.set("token", "base")

  const response = await fetchJson<OvlOhlcvResponse>(url.toString(), {
    headers: {
      accept: "application/json",
    },
  })
  const ohlcvList = response.data?.attributes?.ohlcv_list

  if (!Array.isArray(ohlcvList)) {
    throw new Error("OVL/USD price response was invalid")
  }

  const pricesByDay = new Map<number, number>()

  for (const item of ohlcvList) {
    const [timestamp, , high] = item

    if (
      typeof timestamp === "number" &&
      typeof high === "number" &&
      Number.isFinite(high) &&
      high > 0
    ) {
      pricesByDay.set(getUtcDayStart(timestamp), high)
    }
  }

  if (pricesByDay.size === 0) {
    throw new Error("OVL/USD price response did not include usable prices")
  }

  return pricesByDay
}

function addFeeEventByDay(
  feesByMarketByDay: Map<string, Map<number, bigint>>,
  event: FeeEventMarket,
  rawAmount?: string
) {
  if (!rawAmount || !event.timestamp) {
    return
  }

  const marketId = event.position?.market?.id?.toLowerCase()
  const timestamp = Number(event.timestamp)

  if (!marketId || !Number.isFinite(timestamp)) {
    return
  }

  const day = getUtcDayStart(timestamp)
  const feesByDay = feesByMarketByDay.get(marketId) || new Map<number, bigint>()
  feesByDay.set(day, (feesByDay.get(day) || BigInt(0)) + BigInt(rawAmount))
  feesByMarketByDay.set(marketId, feesByDay)
}

async function getThirtyDayFeesByMarketByDay(markets: EnabledMarket[]) {
  const toTimestamp = Math.floor(Date.now() / 1000)
  const fromTimestamp =
    toTimestamp - MARKET_FEE_LOOKBACK_DAYS * SECONDS_PER_DAY
  const feesByMarketByDay = new Map<string, Map<number, bigint>>()
  let skip = 0

  while (true) {
    const page = await fetchMarketFeeEventPage(
      markets,
      fromTimestamp,
      toTimestamp,
      skip
    )

    for (const event of page.builds) {
      addFeeEventByDay(feesByMarketByDay, event, event.feeAmount)
    }

    for (const event of page.unwinds) {
      addFeeEventByDay(feesByMarketByDay, event, event.feeAmount)
    }

    for (const event of page.liquidates) {
      addFeeEventByDay(feesByMarketByDay, event, event.transferFeeAmount)
    }

    const pageSizes = [
      page.builds.length,
      page.liquidates.length,
      page.unwinds.length,
    ]

    if (!pageSizes.some((pageSize) => pageSize === SUBGRAPH_PAGE_SIZE)) {
      break
    }

    skip += SUBGRAPH_PAGE_SIZE
  }

  return feesByMarketByDay
}

async function getThirtyDayMarketFeesByAddress(markets: EnabledMarket[]) {
  const [feesByMarketByDay, ovlUsdPricesByDay] = await Promise.all([
    getThirtyDayFeesByMarketByDay(markets),
    getOvlUsdPricesByDay(),
  ])
  const feesByAddress = new Map<string, MarketFeeTotal>()

  for (const [marketId, feesByDay] of feesByMarketByDay) {
    let feesOvl = 0
    let feesUsd = 0

    for (const [day, rawFees] of feesByDay) {
      const ovlUsdPrice = ovlUsdPricesByDay.get(day)

      if (ovlUsdPrice === undefined) {
        throw new Error("Missing daily OVL/USD price")
      }

      const dailyFeesOvl = parseBigIntUnits(rawFees, OVL_DECIMALS)
      feesOvl += dailyFeesOvl
      feesUsd += dailyFeesOvl * ovlUsdPrice
    }

    feesByAddress.set(marketId, {
      feesOvl,
      feesUsd,
    })
  }

  return feesByAddress
}

async function getMarketFeeRows() {
  const markets = await getEnabledMarkets()
  const feesByAddress = await getThirtyDayMarketFeesByAddress(markets)

  const rows = markets
    .map((market): MarketFeeRow | undefined => {
      const fees = feesByAddress.get(market.address)

      if (fees === undefined) {
        return undefined
      }

      return {
        feesOvl: fees.feesOvl,
        feesUsd: fees.feesUsd,
        market: market.label,
        ticker: market.ticker,
      }
    })
    .filter((row): row is MarketFeeRow => row !== undefined)
    .sort((left, right) => right.feesUsd - left.feesUsd)

  if (rows.length === 0) {
    throw new Error("No market fees were returned")
  }

  const totalFeesUsd = rows.reduce((sum, row) => sum + row.feesUsd, 0)

  return {
    lastSyncedAt: new Date(),
    rows: rows.slice(0, MARKET_FEE_ROW_LIMIT),
    totalFeesUsd,
  }
}

function getRemainingUsdt(funded: number, target: number) {
  const remaining = target - funded

  if (remaining <= FILL_TOLERANCE_USDT) {
    return 0
  }

  return remaining
}

function getFundingProgress(funded: number, target: number) {
  if (target <= 0) {
    return 0
  }

  if (getRemainingUsdt(funded, target) === 0) {
    return 100
  }

  return Math.min(100, Math.max(0, (funded / target) * 100))
}

function getPoolStatus(funded: number, target: number) {
  return getRemainingUsdt(funded, target) === 0 ? "Filled" : "Open"
}

function getBalanceOfCallData(address: string) {
  return `${BALANCE_OF_SELECTOR}${address
    .toLowerCase()
    .replace(/^0x/, "")
    .padStart(64, "0")}`
}

function parseTokenBalance(rawBalance: string, decimals: number) {
  const raw = BigInt(rawBalance)
  const scale = BigInt(10) ** BigInt(decimals)
  const whole = raw / scale
  const fraction = raw % scale

  return Number(whole) + Number(fraction) / Number(scale)
}

async function getBscUsdtBalance(address: string) {
  const response = await fetch(BSC_RPC_URL, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          data: getBalanceOfCallData(address),
          to: BSC_USDT_CONTRACT,
        },
        "latest",
      ],
    }),
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
    signal: AbortSignal.timeout(BSC_RPC_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`BSC RPC request failed: ${response.status}`)
  }

  const data = (await response.json()) as { result?: string }

  if (!data.result) {
    throw new Error("BSC RPC response did not include a balance result")
  }

  return parseTokenBalance(data.result, USDT_DECIMALS)
}

const activePoolSources = [
  {
    id: "alt-usd",
    name: "ALT Pool",
    market: "ALT / USD",
    safeAddress: "0x86048544860d72466C2105d66Cb97F1504cc2937",
    targetUsdt: 10000,
    appHref: LINKS.communityPools,
    details: [
      { label: "Chain", value: "BSC" },
      { label: "Safe", value: "0x8604...2937" },
      { label: "Deadline", value: "Jun 06, 2026" },
    ],
  },
]

async function getActivePools() {
  return Promise.all(
    activePoolSources.map(async (pool) => {
      const fundedUsdt = await getBscUsdtBalance(pool.safeAddress)

      return {
        ...pool,
        fundedUsdt,
      }
    })
  )
}

function SkeletonLine({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "block animate-pulse rounded-sm bg-surface-container-highest",
        className,
      ].join(" ")}
    />
  )
}

function RevenueDashboardSkeleton() {
  return (
    <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
      <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-1 shadow-2xl relative scanline-effect backdrop-blur-md">
        <div className="bg-surface-container-highest rounded-t-lg flex items-center justify-between gap-4 p-3 border-b border-outline-variant/50">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-caps text-[10px] text-secondary-container tracking-widest uppercase">
              Protocol Revenue Data
            </span>
          </div>
          <span className="font-data-md text-[10px] sm:text-xs text-on-surface-variant tracking-widest whitespace-nowrap">
            OVL // EARNINGS_DASHBOARD
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 rounded-b-lg bg-surface-container-low p-5 sm:p-8 lg:p-10">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:gap-12">
              <div className="min-w-0">
                <span className="font-label-caps text-[10px] text-on-surface-variant block mb-3 tracking-widest uppercase">
                  30D Protocol Fees
                </span>
                <SkeletonLine className="h-12 sm:h-14 lg:h-16 w-full max-w-md" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 sm:p-6">
            <span className="font-label-caps text-[10px] text-on-surface-variant block mb-6 border-b border-outline-variant/50 pb-3 tracking-widest uppercase">
              30D Fees By Market
            </span>
            <div className="space-y-4">
              {Array.from({ length: MARKET_FEE_ROW_LIMIT }).map((_, item) => (
                <div className="space-y-2" key={item}>
                  <div className="flex justify-between items-center gap-4">
                    <SkeletonLine className="h-4 w-28" />
                    <SkeletonLine className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

async function RevenueDashboardPanel() {
  let dashboardData: Awaited<ReturnType<typeof getMarketFeeRows>>

  try {
    dashboardData = await getMarketFeeRows()
  } catch {
    return <RevenueDashboardSkeleton />
  }

  return (
    <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
      <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-1 shadow-2xl relative scanline-effect backdrop-blur-md">
        <div className="bg-surface-container-highest rounded-t-lg flex items-center justify-between gap-4 p-3 border-b border-outline-variant/50">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-caps text-[10px] text-secondary-container tracking-widest uppercase">
              Protocol Revenue Data
            </span>
          </div>
          <span className="font-data-md text-[10px] sm:text-xs text-on-surface-variant tracking-widest whitespace-nowrap">
            OVL // EARNINGS_DASHBOARD
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 rounded-b-lg bg-surface-container-low p-5 sm:p-8 lg:p-10">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:gap-12">
              <div className="min-w-0">
                <span className="font-label-caps text-[10px] text-on-surface-variant block mb-3 tracking-widest uppercase">
                  30D Protocol Fees
                </span>
                <span className="block break-words font-data-lg text-4xl sm:text-5xl lg:text-6xl text-primary leading-tight">
                  {formatUsdAmount(dashboardData.totalFeesUsd, {
                    compact: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 sm:p-6">
            <span className="font-label-caps text-[10px] text-on-surface-variant block mb-6 border-b border-outline-variant/50 pb-3 tracking-widest uppercase">
              30D Fees By Market
            </span>
            <div className="max-h-[440px] space-y-4 overflow-y-auto pr-1 font-data-md text-sm">
              {dashboardData.rows.map((market) => (
                <div className="space-y-1" key={market.ticker}>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-on-background">{market.market}</span>
                    <span className="text-primary text-right whitespace-nowrap">
                      {formatUsdAmount(market.feesUsd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4 font-label-caps text-[10px] uppercase tracking-widest">
                    <span className="text-on-surface-variant">
                      {market.ticker}
                    </span>
                    <span className="text-on-surface-variant text-right whitespace-nowrap">
                      {formatCompactNumber(market.feesOvl)} OVL
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-outline-variant/50 flex justify-between items-center gap-4">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                  Synced {formatUtcTime(dashboardData.lastSyncedAt)}
                </span>
                <a
                  className="font-label-caps text-[10px] text-primary uppercase tracking-widest hover:text-primary-container transition-colors"
                  href={LINKS.markets}
                  {...externalLinkProps}
                >
                  All Markets
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ActivePoolsSkeleton() {
  return (
    <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-label-caps text-[10px] text-primary tracking-[0.2em] uppercase block mb-3">
            Live Queue
          </span>
          <h2 className="font-headline-md text-3xl md:text-4xl text-secondary">
            Active Pools
          </h2>
        </div>
        <SkeletonLine className="h-3 w-20" />
      </div>

      <div className="max-w-3xl mx-auto bg-surface-container-low border border-outline-variant/50 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-outline-variant/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background border border-outline-variant/50 rounded-lg animate-pulse" />
              <div className="space-y-3">
                <SkeletonLine className="h-6 w-32" />
                <SkeletonLine className="h-3 w-20" />
              </div>
            </div>
            <SkeletonLine className="h-6 w-16" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between gap-4">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-4 w-24" />
            </div>
            <div className="w-full h-3 bg-background border border-outline-variant/50">
              <div className="h-full w-full animate-pulse bg-surface-container-highest" />
            </div>
            <div className="flex justify-end">
              <SkeletonLine className="h-3 w-36" />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          {[0, 1, 2].map((item) => (
            <div
              className="flex justify-between items-center gap-4 py-2 border-b border-outline-variant/30 last:border-b-0"
              key={item}
            >
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-4 w-28" />
            </div>
          ))}
        </div>

        <div className="p-6 md:p-8 bg-surface-container-lowest">
          <SkeletonLine className="h-12 w-full" />
        </div>
      </div>
    </section>
  )
}

async function ActivePoolsSection() {
  let activePools: Awaited<ReturnType<typeof getActivePools>>

  try {
    activePools = await getActivePools()
  } catch {
    return <ActivePoolsSkeleton />
  }

  return (
    <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-label-caps text-[10px] text-primary tracking-[0.2em] uppercase block mb-3">
            Live Queue
          </span>
          <h2 className="font-headline-md text-3xl md:text-4xl text-secondary">
            Active Pools
          </h2>
        </div>
        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
          {activePools.length} Listed
        </span>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {activePools.map((pool) => {
          const remainingUsdt = getRemainingUsdt(
            pool.fundedUsdt,
            pool.targetUsdt
          )
          const progress = getFundingProgress(
            pool.fundedUsdt,
            pool.targetUsdt
          )
          const progressLabel = Number(progress.toFixed(1))
          const status = getPoolStatus(pool.fundedUsdt, pool.targetUsdt)

          return (
            <article
              className="bg-surface-container-low border border-outline-variant/50 rounded-xl overflow-hidden shadow-2xl"
              key={pool.id}
            >
              <div className="p-6 md:p-8 border-b border-outline-variant/50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background flex items-center justify-center border border-outline-variant/50 rounded-lg">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-2xl text-secondary leading-none">
                        {pool.name}
                      </h3>
                      <span className="font-label-caps text-[10px] text-on-surface-variant mt-2 block tracking-widest uppercase">
                        {pool.market}
                      </span>
                    </div>
                  </div>
                  <span className="self-start text-secondary-container font-label-caps text-[10px] border border-secondary-container/30 px-3 py-1 bg-secondary-container/5 uppercase tracking-widest">
                    {status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between gap-4 font-data-md text-sm">
                    <span className="text-on-background">
                      {formatUsdtAmount(pool.fundedUsdt)}
                    </span>
                    <span className="text-on-surface-variant">
                      {formatUsdtAmount(pool.targetUsdt)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-background border border-outline-variant/50">
                    <div
                      aria-label={`${pool.name} is ${progressLabel}% funded`}
                      className="h-full bg-secondary-container"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {formatUsdtAmount(remainingUsdt)} Remaining
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                {pool.details.map((detail) => (
                  <div
                    className="flex justify-between items-center gap-4 py-2 border-b border-outline-variant/30 last:border-b-0"
                    key={detail.label}
                  >
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {detail.label}
                    </span>
                    <span className="font-data-md text-sm text-on-background text-right">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 md:p-8 bg-surface-container-lowest">
                <a
                  className="inline-flex w-full items-center justify-center gap-3 bg-primary text-on-primary py-4 px-5 rounded font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-container active:scale-[0.98] transition-all"
                  href={pool.appHref}
                  {...externalLinkProps}
                >
                  <span className="material-symbols-outlined text-lg">
                    wallet
                  </span>
                  Fund In App
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default function EcosystemPage() {
  return (
    <>
      <MarketingNav activePage="ecosystem" />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        <section className="max-w-container-max mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-overlay opacity-30 pointer-events-none z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7 space-y-7 md:space-y-8">
              <span className="font-label-caps text-xs text-primary tracking-[0.2em] block uppercase">
                Community-Funded Listings
              </span>
              <div className="space-y-5 md:space-y-6">
                <h1 className="font-headline-xl text-5xl md:text-6xl text-secondary max-w-3xl leading-tight text-balance">
                  Community Pools
                </h1>
                <p className="font-body-md text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
                  Fund a token&apos;s perps market together. When a pool reaches
                  its target, Overlay launches the market with a 0.1% trading fee
                  and contributors share 30% of those fees pro-rata.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  className="inline-flex items-center justify-center bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3.5 rounded uppercase tracking-wider hover:bg-primary-container transition-colors duration-200"
                  href={LINKS.communityPools}
                  {...externalLinkProps}
                >
                  View Community Pools
                </a>
                <a
                  className="inline-flex items-center justify-center gap-2 bg-transparent border border-primary/40 text-primary font-label-caps text-label-caps px-6 py-3.5 rounded uppercase tracking-wider hover:bg-primary/10 transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  href={LINKS.communityPools}
                  {...externalLinkProps}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    confirmation_number
                  </span>
                  Referral Code
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 bg-outline-variant/50 gap-px rounded-xl border border-outline-variant/50 overflow-hidden shadow-2xl">
                {poolMetrics.map((metric) => (
                  <div
                    className="bg-surface-container-lowest p-6 min-h-[140px] flex flex-col justify-between"
                    key={metric.label}
                  >
                    <span className="font-label-caps text-[10px] text-on-surface-variant tracking-widest uppercase">
                      {metric.label}
                    </span>
                    <span className="font-data-lg text-3xl text-secondary">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<RevenueDashboardSkeleton />}>
          <RevenueDashboardPanel />
        </Suspense>

        <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {mechanismSteps.map((step) => (
              <div
                className="group bg-surface-container-low border border-outline-variant/50 p-6 md:p-8 rounded-lg shadow-xl transition-colors duration-200 hover:border-primary/40"
                key={step.title}
              >
                <span className="material-symbols-outlined text-2xl text-primary mb-6 block">
                  {step.icon}
                </span>
                <h2 className="font-headline-md text-2xl text-secondary mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h2>
                <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] border border-outline-variant/50 rounded-xl overflow-hidden bg-surface-container-low shadow-2xl">
            <div className="p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-outline-variant/50">
              <h2 className="font-headline-md text-2xl md:text-3xl text-secondary mb-3">
                Monthly ROI reach
              </h2>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest leading-relaxed">
                Based on a $10K pool, 0.1% trading fee, and 30% contributor
                share.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              {roiStats.map((stat, index) => (
                <div
                  className={[
                    "p-6 md:p-8 flex flex-col gap-2",
                    index < roiStats.length - 1
                      ? "border-b md:border-b-0 md:border-r border-outline-variant/50"
                      : "",
                  ].join(" ")}
                  key={stat.volume}
                >
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                    {stat.volume}
                  </span>
                  <span className="font-data-lg text-2xl text-secondary-container">
                    {stat.roi}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest leading-relaxed">
            Volume is the total trade size counted at both entry and unwind over
            the month.
          </p>
        </section>

        <section className="max-w-container-max mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <div className="border-t border-outline-variant/30 pt-10">
              <span className="font-label-caps text-xs text-on-surface-variant tracking-[0.3em] uppercase block mb-8">
                Backed By
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
                {backers.map((backer) => (
                  <div
                    className="min-h-20 border border-outline-variant/50 bg-surface-container-lowest px-4 flex items-center justify-center grayscale contrast-125"
                    key={backer}
                  >
                    <span className="font-headline-md text-lg text-secondary font-bold tracking-tighter text-center uppercase">
                      {backer}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-outline-variant/30 pt-10">
              <span className="font-label-caps text-xs text-on-surface-variant tracking-[0.3em] uppercase block mb-8">
                Audited By
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
                {auditors.map((auditor) => (
                  <a
                    aria-label={auditor.externalLinkText}
                    className="min-h-20 border border-outline-variant/50 bg-surface-container-lowest px-4 flex items-center justify-center gap-3 grayscale contrast-125 hover:grayscale-0 transition-all"
                    href={auditor.completedAuditHref}
                    key={auditor.name}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-primary text-xl">
                      verified_user
                    </span>
                    <span className="font-headline-md text-lg text-secondary font-bold tracking-tighter text-center uppercase leading-tight">
                      {auditor.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<ActivePoolsSkeleton />}>
          <ActivePoolsSection />
        </Suspense>
      </main>
      <MarketingFooter />
    </>
  )
}
