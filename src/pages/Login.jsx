import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  function submit(e) {
    e.preventDefault()
    if (!name) return
    localStorage.setItem('name', name)
    navigate('/lobby')
  }

  return (
    <form onSubmit={submit}>
      <h1>Enter your name</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
      />
      <button>Enter</button>
    </form>
  )
}