import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from '@/components/ui/button'
import Homepage from './pages/homepage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Button>Click me!</Button>
        <Homepage />
        
      </div>
      
    </>
  )
}

export default App
