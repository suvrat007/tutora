import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("App error boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8ede3] p-6">
          <div className="max-w-md w-full bg-white/80 border border-[#e6c8a8] rounded-2xl shadow-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-[#5a4a3c] mb-2">Something went wrong</h2>
            <p className="text-[#7b5c4b] mb-4">Please refresh the page. If the issue persists, contact support.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-[#e0c4a8] text-[#5a4a3c] font-medium">
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


