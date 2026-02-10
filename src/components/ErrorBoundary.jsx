import { Component } from 'react'
import { Link } from 'react-router-dom'
import DotGrid from './DotGrid'
import Navbar from './Navbar'
import Footer from './Footer'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <>
                    <DotGrid />
                    <div className="page-wrapper">
                        <Navbar />
                        <main className="error-page">
                            <div className="error-icon">⚡</div>
                            <h1 className="error-title">Something went wrong</h1>
                            <p className="error-text">
                                An unexpected error occurred. Please try again or return to the home page.
                            </p>
                            <div className="error-actions">
                                <button className="cta-button" onClick={this.handleReset}>
                                    Try Again <span className="cta-arrow">→</span>
                                </button>
                                <Link to="/" className="cta-button cta-button--secondary" onClick={this.handleReset}>
                                    ← Back to Home
                                </Link>
                            </div>
                        </main>
                        <Footer />
                    </div>
                </>
            )
        }

        return this.props.children
    }
}
