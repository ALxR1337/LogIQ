export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner">
                <div className="spinner-ring" />
                <div className="spinner-ring spinner-ring--inner" />
                <div className="spinner-dot" />
            </div>
            <p className="loading-text">{text}</p>
        </div>
    )
}
