import { useState } from 'react'
import './App.css'
import { useEffect } from 'react'

function App() {
  const [message, setMessage] = useState("")

  useEffect(() =>{
    fetch('/api/test')
    .then(response => response.json())
    .then(data => setMessage(data.message))
    .catch(error => console.error('Error fetching message:', error));
  },[])

  return (
    <>
      <div>
        <h1>Itenary Planner</h1>
        <p>{message || 'Loading....'}</p>
      </div>
    </>
  )
}

export default App
