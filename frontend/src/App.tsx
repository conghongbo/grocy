import { useEffect, useState } from 'react'
import StockPage from './pages/StockPage'
import ActivityPage from './pages/ActivityPage'
import { configuration } from './api/client'
const pages = ['stock', 'inventory', 'chores', 'tasks', 'batteries'] as const
type Page = typeof pages[number]
function current(): Page { const value = location.hash.slice(1); return pages.find(p => p === value && configuration.features?.[p] !== false) ?? pages.find(p => configuration.features?.[p] !== false) ?? 'stock' }
export default function App() {
  const [page, setPage] = useState(current)
  useEffect(() => { const change = () => setPage(current()); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change) }, [])
  return <><header><a className="brand" href="#stock">grocy</a><span>Household management</span><a href={`${configuration.legacyUrl}/`}>Legacy interface</a></header>
    <nav aria-label="Main navigation">{pages.filter(p => configuration.features?.[p] !== false).map(p => <a key={p} href={`#${p}`} aria-current={p === page ? 'page' : undefined}>{p[0].toUpperCase() + p.slice(1)}</a>)}</nav>
    <main>{page === 'stock' || page === 'inventory' ? <StockPage key={page} inventory={page === 'inventory'} /> : <ActivityPage key={page} kind={page} />}</main>
    <footer>React migration preview · Existing Grocy API and session</footer></>
}
