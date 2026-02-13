# LogIQ — Precision IQ Testing Platform

**LogIQ** is a modern, high-performance IQ test application built with **React** and **Vite**. It features a psychometrically-calibrated 30-question test designed to measure cognitive abilities across five key domains: Pattern Recognition, Sequence Completion, Logical Deduction, Spatial Reasoning, and Analogies.

The application is built with a focus on user experience, featuring smooth animations, a responsive design, and a conversion-optimized flow where users take the test for free but register to unlock detailed results.

## ✨ Key Features

- **Professional-Grade Assessment**: 30 questions covering 5 cognitive domains with varying difficulty levels.
- **Dynamic Quiz Engine**:
  - 25-minute timed sessions with visual urgency indicators.
  - Auto-save progress (resumes if browser is closed).
  - Practice / Demo mode for quick trials.
- **Conversion-Focused Flow**:
  - **Teaser Results**: Unauthenticated users see a rigorous teaser screen.
  - **Gated Breakdown**: Full score, percentile, and bell curve analysis require account creation.
- **Rich Visualization**:
  - Interactive Bell Curve and Breakdown Charts.
  - Animated score reveals and progress tracking.
  - Downloadable High-Res Result Certificates.
- **Tech Highlights**:
  - **Zero-Backend Auth**: Secure client-side authentication using LocalStorage and Web Crypto API (SHA-256 + salt) for a privacy-first approach.
  - **Performance**: Lazy-loaded routes, code splitting, and optimized assets.
  - **Shareable Results**: Unique permalinks and social sharing integration.

## 🛠 Tech Stack

- **Core**: React 19, Vite calculation
- **Routing**: React Router DOM 7
- **State Management**: React Context API + useReducer
- **Styling**: Vanilla CSS (CSS Modules approach), Responsive Design
- **Persistence**: LocalStorage (Crypto-secured user data & session state)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/logiq.git
    cd logiq
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in browser**:
    Navigate to `http://localhost:5173` to view the app.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate the `dist` folder ready for deployment to Vercel, Netlify, or any static host.

## 📂 Project Structure

```
iqtest/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (Navbar, QuestionCard, etc.)
│   ├── context/         # Global state (QuizContext, AuthContext)
│   ├── data/            # Question bank & scoring logic
│   ├── pages/           # Page components (Landing, Quiz, Results, Login, etc.)
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app component & routing
│   └── main.jsx         # Entry point
└── PLAN.md              # Detailed project roadmap & status
```

## 🔒 Privacy & Security

LogIQ is designed with privacy in mind.
- **No Tracking**: No external analytics or tracking scripts.
- **Local Data**: All quiz progress and user data are stored locally in the browser.
- **Client-Side Auth**: Passwords are salted and hashed using the Web Crypto API before being stored locally.

## 📜 License

This project is open-source and available under the MIT License.
