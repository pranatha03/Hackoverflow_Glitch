import React from 'react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100vw', height: '100vh',
                    background: '#020910',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#ff4422',
                }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.2em', marginBottom: '16px' }}>
                        SYSTEM FAULT — RENDERING SUBSYSTEM FAILURE
                    </div>
                    <div style={{ color: '#2e5470', fontSize: '9px', letterSpacing: '0.1em', maxWidth: 480, textAlign: 'center' }}>
                        {String(this.state.error?.message || 'Unknown error')}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            marginTop: '24px', padding: '6px 20px',
                            border: '1px solid #ff442233', background: 'transparent',
                            color: '#ff4422', fontSize: '8px', letterSpacing: '0.14em',
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        REINITIALIZE
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}
