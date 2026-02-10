const STATS = [
    { value: <>2<span className="accent">.</span>4M<span className="accent">+</span></>, label: 'Tests Completed' },
    { value: '30', label: 'Questions' },
    { value: <>~15<span className="accent">min</span></>, label: 'Average Duration' },
    { value: <>98<span className="accent">%</span></>, label: 'Accuracy Rate' },
]

export default function StatsStrip() {
    return (
        <section className="stats-strip" aria-label="Statistics">
            {STATS.map((stat, i) => (
                <div className="stat-item" key={i}>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </section>
    )
}
