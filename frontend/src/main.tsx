import { Component } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p role="alert">Unable to load Tasks. Use the legacy link below.</p> : this.props.children }
}
const root = document.getElementById('grocy-react-root')
if (root) createRoot(root).render(<ErrorBoundary><App /></ErrorBoundary>)
