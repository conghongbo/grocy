import { context, route } from '../app/context'
export function finishForm(category: boolean, another: boolean) {
  if (another) { window.location.href = route(`/task/new${context.embedded ? '?embedded' : ''}`); return }
  if (context.embedded) window.parent.postMessage(window.WindowMessageBag('Reload'), window.location.origin)
  else {
    const returnTo = new URLSearchParams(window.location.search).get('returnto')
    // Preserve safe application-local return links only.
    window.location.href = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? route(returnTo) : route(category ? '/taskcategories' : '/tasks')
  }
}
