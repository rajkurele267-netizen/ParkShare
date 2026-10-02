import { Component, type ReactNode } from 'react'

/** Last line of defence: shows a friendly screen instead of a blank page if something unexpected crashes. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  componentDidCatch(error: unknown) { console.error('Unexpected error:', error) }

  render() {
    if (!this.state.crashed) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Something went wrong</h1>
          <p className="mt-2 text-slate-600">Please reload the page. If the problem continues, try again in a few minutes.</p>
          <button onClick={() => window.location.assign('/')} className="mt-6 rounded-lg bg-navy-950 px-5 py-2.5 font-semibold text-white hover:bg-navy-800">Back to home</button>
        </div>
      </div>
    )
  }
}
