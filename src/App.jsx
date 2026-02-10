import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import CookieConsent from './components/CookieConsent'

// Lazy-loaded routes for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const About = lazy(() => import('./pages/About'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Practice = lazy(() => import('./pages/Practice'))
const Results = lazy(() => import('./pages/Results'))
const SharedResults = lazy(() => import('./pages/Results').then(m => ({ default: m.SharedResults })))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ToastProvider>
                    <QuizProvider>
                        <a href="#main-content" className="skip-link">Skip to content</a>
                        <ScrollToTop />
                        <Suspense fallback={
                            <div className="page-wrapper">
                                <LoadingSpinner text="Loading..." />
                            </div>
                        }>
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/faq" element={<FAQ />} />
                                <Route path="/test" element={<Quiz />} />
                                <Route path="/practice" element={<Practice />} />
                                <Route path="/results" element={<Results />} />
                                <Route path="/results/:id" element={<SharedResults />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                        <CookieConsent />
                    </QuizProvider>
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
