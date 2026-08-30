import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

export default function Analytics() {
  const location = useLocation()

  // Load the GA script once, on first mount
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() { window.dataLayer.push(arguments) }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  }, [])

  // Fire a page_view on every route change — GA doesn't know about React
  // Router navigations on its own since the page never actually reloads.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location])

  return null
}
