import { useEffect, useState } from 'react'
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    // This effect synchronizes loading state with an external network request.
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true); setError('')
    load(controller.signal).then(value => { if (!controller.signal.aborted) setData(value) }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [load, version])
  return { data, error, loading, refresh: () => setVersion(v => v + 1) }
}
export function useAction(refresh: () => void) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [undo, setUndo] = useState<(() => Promise<unknown>)>()
  async function run(action: () => Promise<unknown>, undoAction?: () => Promise<unknown>) {
    if (busy) return
    setBusy(true); setError(''); setMessage(''); setUndo(undefined)
    try { await action(); setMessage('Saved successfully.'); setUndo(() => undoAction); refresh() }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
    finally { setBusy(false) }
  }
  return { busy, run, feedback: <><p role="status">{message} {undo && <button disabled={busy} onClick={() => run(undo)}>Undo</button>}</p>{error && <p role="alert" className="error">{error}</p>}</> }
}
