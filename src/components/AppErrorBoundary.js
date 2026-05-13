import React from 'react';

/**
 * Top-level error boundary so a single bad widget can't blank the whole
 * dashboard. Renders a recoverable fallback with a "Try again" action that
 * remounts the subtree.
 */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary caught:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState((prev) => ({ error: null, resetKey: prev.resetKey + 1 }));
  };

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="app-error-boundary" role="alert" style={fallbackStyle}>
          <div style={cardStyle}>
            <div style={titleStyle}>Something went wrong.</div>
            <div style={messageStyle}>
              {this.state.error?.message || 'An unexpected error occurred while rendering the dashboard.'}
            </div>
            <div style={buttonRowStyle}>
              <button type="button" onClick={this.handleRetry} style={primaryButtonStyle}>
                Try again
              </button>
              <button type="button" onClick={this.handleReload} style={secondaryButtonStyle}>
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

const fallbackStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'var(--bg, #f7f7f8)'
};

const cardStyle = {
  maxWidth: 480,
  width: '100%',
  padding: '24px',
  borderRadius: 12,
  background: 'var(--card-bg, #fff)',
  border: '1px solid var(--border, #e5e7eb)',
  boxShadow: '0 1px 2px rgba(0,0,0,.04)'
};

const titleStyle = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 8,
  color: 'var(--text, #111827)'
};

const messageStyle = {
  fontSize: 14,
  color: 'var(--text-muted, #4b5563)',
  marginBottom: 16,
  wordBreak: 'break-word'
};

const buttonRowStyle = {
  display: 'flex',
  gap: 8
};

const primaryButtonStyle = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid transparent',
  background: 'var(--accent, #4f46e5)',
  color: '#fff',
  fontWeight: 500,
  cursor: 'pointer'
};

const secondaryButtonStyle = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid var(--border, #d1d5db)',
  background: 'transparent',
  color: 'var(--text, #111827)',
  fontWeight: 500,
  cursor: 'pointer'
};

export default AppErrorBoundary;
