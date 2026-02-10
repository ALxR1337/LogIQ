import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StatsStrip from '../components/StatsStrip'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

export default function Landing() {
    useDocumentHead(null, 'Measure your cognitive ability with a scientifically designed IQ assessment. 30 questions, 25 minutes, instant results.')
    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />
                <main id="main-content">
                    <Hero />
                    <StatsStrip />
                </main>
                <Footer />
            </div>
        </>
    )
}
