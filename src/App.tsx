
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/Pages/Dashboard'
import Leaderboard from '@/Pages/Leaderboard'

function App() {
  return (
    <BrowserRouter>
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
