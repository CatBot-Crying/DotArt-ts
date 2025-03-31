import { useState } from 'react'
import DotArtConverter from './components/DotArtConverter'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Dot Art Converter</h1>
      <DotArtConverter />
    </div>
  )
}

export default App