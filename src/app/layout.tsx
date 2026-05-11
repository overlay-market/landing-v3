import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

/* eslint-disable @next/next/no-page-custom-font */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const GA_MEASUREMENT_ID = "G-QJR084KXFT"

export const metadata: Metadata = {
  title: "Overlay Protocol - Perps for the Long Tail",
  description:
    "Access perpetual markets for emerging tokens, pre-CEX assets, and narrative-driven assets that traditional venues can't support.",
  icons: {
    icon: "/Overlay-logo.jpg",
    apple: "/Overlay-logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden selection:bg-primary selection:text-on-primary">
        {children}
      </body>
      <Script id="overlay-ga-optout" strategy="beforeInteractive">
        {`
          var gaProperty = '${GA_MEASUREMENT_ID}';
          var disableStr = 'ga-disable-' + gaProperty;
          if (document.cookie.indexOf(disableStr + '=true') > -1) {
            window[disableStr] = true;
          }
        `}
      </Script>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  )
}
