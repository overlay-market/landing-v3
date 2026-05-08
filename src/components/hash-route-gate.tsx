"use client"

import { useEffect, useState, type ReactNode } from "react"

import AccessDenied from "@/components/legal/access-denied"
import TermsOfService from "@/components/legal/terms-of-service"

type HashRoute = "access-denied" | "tos" | null

function getHashRoute(): HashRoute {
  const hashPath = window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "").toLowerCase()

  if (hashPath === "tos") {
    return "tos"
  }

  if (hashPath === "accessdenied" || hashPath === "access-denied") {
    return "access-denied"
  }

  return null
}

export function HashRouteGate({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<HashRoute>(null)
  const [hasCheckedHash, setHasCheckedHash] = useState(false)

  useEffect(() => {
    function updateRoute() {
      setRoute(getHashRoute())
      setHasCheckedHash(true)
    }

    updateRoute()
    window.addEventListener("hashchange", updateRoute)

    return () => {
      window.removeEventListener("hashchange", updateRoute)
    }
  }, [])

  if (!hasCheckedHash) {
    return <>{children}</>
  }

  if (route === "tos") {
    return <TermsOfService />
  }

  if (route === "access-denied") {
    return <AccessDenied />
  }

  return <>{children}</>
}
