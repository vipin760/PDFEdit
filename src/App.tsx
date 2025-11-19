import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PdfMerge from './components/PdfMerge'
import Home from './pages/Home'
import AppRoutes from './routes/routes'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <PdfMerge/> */}
      {/* <Home/> */}
      <AppRoutes/>
    </>
  )
}

export default App
