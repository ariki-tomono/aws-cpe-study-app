import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import FlashCard from './components/FlashCard'
import Quiz from './components/Quiz'
import MockExam from './components/MockExam'
import Analytics from './components/Analytics'

function App() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-center text-xl font-bold text-aws-orange mb-5">
        AWS Cloud Practitioner 学習アプリ
      </h1>

      <nav className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { to: '/', label: 'ダッシュボード' },
          { to: '/flashcard', label: 'フラッシュカード' },
          { to: '/quiz', label: 'クイズ' },
          { to: '/exam', label: '模擬試験' },
          { to: '/analytics', label: '分析' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-aws-blue text-gray-200 hover:bg-opacity-80'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flashcard" element={<FlashCard />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/exam" element={<MockExam />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  )
}

export default App
