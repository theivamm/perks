import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[App] Error de render:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-page p-6">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
            <p className="text-lg font-extrabold text-ink">Ups, algo salió mal</p>
            <p className="mt-2 break-words text-xs leading-relaxed text-ink-muted">
              {String(this.state.error?.message || this.state.error)}
            </p>
            <button
              className="btn-primary mx-auto mt-4"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}