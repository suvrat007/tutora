import { useState, useEffect } from "react"

function detectIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.MSStream
  )
}

export function useInstallPWA() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    setIsStandalone(standalone)
    setIsIOS(detectIOS())

    const handler = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const install = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === "accepted") setPromptEvent(null)
  }

  return {
    canInstall: !!promptEvent && !isStandalone,
    install,
    isStandalone,
    showIOSHint: isIOS && !isStandalone,
  }
}
