import { useRegisterSW } from "virtual:pwa-register/react"

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-lg">
      <span className="text-sm text-stone-700">New version available</span>
      <button
        className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700"
        onClick={() => updateServiceWorker(true)}
      >
        Reload
      </button>
      <button
        className="text-xs text-stone-400 hover:text-stone-600"
        onClick={() => setNeedRefresh(false)}
      >
        Dismiss
      </button>
    </div>
  )
}
