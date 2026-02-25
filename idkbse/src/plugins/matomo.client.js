export default ({ app }) => {
  if (!process.client) return

  // Avoid double-loading
  if (window._paq) return

  const _paq = (window._paq = window._paq || [])

  _paq.push(['trackPageView'])
  _paq.push(['enableLinkTracking'])

  ;(function () {
    const u = process.env.PUBLIC_MATOMO_URL
    _paq.push(['setTrackerUrl', u + 'matomo.php'])
    _paq.push(['setSiteId', 27])

    const d = document
    const g = d.createElement('script')
    const s = d.getElementsByTagName('script')[0]

    g.async = true
    g.src = u + 'matomo.js'
    s.parentNode.insertBefore(g, s)
  })()

  // Track SPA route changes
  app.router.afterEach((to) => {
    window._paq.push(['setCustomUrl', to.fullPath])
    window._paq.push(['setDocumentTitle', document.title])
    window._paq.push(['trackPageView'])
  })
}