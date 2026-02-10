import { useState } from 'react'
import { Link } from 'react-router-dom'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

const FAQ_DATA = [
    {
        question: 'Is this a real IQ test?',
        answer: 'LogIQ is a scientifically informed cognitive assessment based on established psychometric frameworks (Raven\'s Progressive Matrices, WAIS pattern analysis). While it provides a reliable estimate of cognitive ability, it is not a substitute for a professionally administered clinical IQ test. Think of it as a high-quality approximation.',
    },
    {
        question: 'How accurate is this?',
        answer: 'Our questions are calibrated against validated psychometric models and scored on a standard bell curve (mean=100, SD=15). For most users, scores will fall within ±5 points of a professionally administered test. However, factors like test environment, fatigue, and familiarity with test formats can influence results.',
    },
    {
        question: 'How long does it take?',
        answer: 'The test consists of 30 questions with a total time limit of 25 minutes. Most people complete it in 15–20 minutes. Questions increase in difficulty as you progress, so earlier questions will feel faster.',
    },
    {
        question: 'Can I retake the test?',
        answer: 'Yes — you can retake the test as many times as you like. However, keep in mind that practice effects can inflate scores on repeated attempts. For the most accurate result, your first attempt is typically the best indicator.',
    },
    {
        question: 'Is my data stored?',
        answer: 'No. LogIQ runs entirely in your browser. Your answers, score, and results are never sent to a server. Nothing is stored beyond your current session. When you close the tab, your data is gone.',
    },
    {
        question: 'What do the scores mean?',
        answer: 'IQ scores follow a normal distribution: 100 is the population average, with a standard deviation of 15. About 68% of people score between 85–115. A score of 130+ places you in the top 2% — "Exceptionally Gifted." Below 70 is considered "Extremely Low" and is seen in roughly 2% of the population.',
    },
    {
        question: 'What categories are tested?',
        answer: 'LogIQ tests five cognitive domains: Pattern Recognition (visual matrix puzzles), Sequence Completion (number/letter/shape sequences), Logical Deduction (verbal reasoning), Spatial Reasoning (mental rotation & transformation), and Analogies (relational reasoning). Each domain has 6 questions.',
    },
    {
        question: 'Why is there a time limit?',
        answer: 'Processing speed is a component of cognitive ability. Timed conditions ensure the test measures fluid intelligence — your ability to solve novel problems under pressure — rather than crystallized knowledge that can be looked up. The 25-minute window is generous for most test takers.',
    },
]

function AccordionItem({ item, isOpen, onToggle, index }) {
    const headingId = `faq-q-${index}`
    const panelId = `faq-a-${index}`
    return (
        <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
            <button
                className="faq-question"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={panelId}
                id={headingId}
            >
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            <div
                className="faq-answer-wrapper"
                style={{ maxHeight: isOpen ? '500px' : '0' }}
                role="region"
                id={panelId}
                aria-labelledby={headingId}
            >
                <p className="faq-answer">{item.answer}</p>
            </div>
        </div>
    )
}

export default function FAQ() {
    useDocumentHead('FAQ', 'Answers to common questions about LogIQ: test accuracy, duration, scoring methodology, data privacy, and more.')
    const [openIndex, setOpenIndex] = useState(null)

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="faq-page" id="main-content">
                    <div className="faq-hero">
                        <span className="about-label">FAQ</span>
                        <h1 className="about-title">
                            Frequently asked<br />
                            questions<span className="accent-dot">.</span>
                        </h1>
                    </div>

                    <div className="faq-list">
                        {FAQ_DATA.map((item, i) => (
                            <AccordionItem
                                key={i}
                                item={item}
                                index={i}
                                isOpen={openIndex === i}
                                onToggle={() => toggle(i)}
                            />
                        ))}
                    </div>

                    <div className="about-cta">
                        <Link to="/test" className="cta-button">
                            Take the Test <span className="cta-arrow">→</span>
                        </Link>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}
