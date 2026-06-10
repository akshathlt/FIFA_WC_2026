import { useEffect, useState } from 'react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'Just now'
}

export default function NewsSidebar() {
  const [articles, setArticles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/news')
      .then(r => r.json())
      .then(json => {
        const items = (json.articles || []).slice(0, 10).map(a => ({
          title:    a.headline,
          desc:     a.description,
          img:      a.images?.[0]?.url,
          link:     a.links?.web?.href,
          date:     a.published,
          category: a.categories?.find(c => c.type === 'topic')?.description || 'World Cup',
        }))
        setArticles(items)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-0 sticky top-0 h-screen overflow-y-auto border-l border-slate-800 bg-slate-900/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
        <div>
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest">📰 WC2026 News</p>
          <p className="text-slate-500 text-xs mt-0.5">via ESPN · auto-refreshes</p>
        </div>
        <span className="text-lg">⚽</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-3xl animate-spin">⚽</div>
          </div>
        )}
        {error && (
          <div className="p-4 text-center text-slate-500 text-xs">
            Could not load news. Check connection.
          </div>
        )}
        {articles.map((a, i) => (
          <a key={i} href={a.link} target="_blank" rel="noopener noreferrer"
            className="block border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
            {/* Thumbnail */}
            {a.img && (
              <div className="relative overflow-hidden h-36 w-full">
                <img src={a.img} alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs bg-green-600/90 text-white px-2 py-0.5 rounded-full font-semibold">
                  {a.category}
                </span>
              </div>
            )}
            {/* Text */}
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-green-400 transition-colors line-clamp-2">
                {a.title}
              </p>
              {a.desc && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{a.desc}</p>
              )}
              <p className="text-xs text-slate-600 mt-1.5">{timeAgo(a.date)}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900 sticky bottom-0">
        <p className="text-xs text-slate-600 text-center">Powered by ESPN · Free API</p>
      </div>
    </aside>
  )
}
