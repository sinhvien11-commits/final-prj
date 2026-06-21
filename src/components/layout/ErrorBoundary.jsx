import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5 text-center">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
          <p className="text-primary font-bold">Đã có lỗi xảy ra.</p>
          <button
            className="border border-primary-fixed text-primary-fixed px-4 py-2 rounded-lg text-sm"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
