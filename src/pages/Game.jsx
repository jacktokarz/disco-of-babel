import { useParams } from 'react-router-dom'

export default function Game() {
  const { id } = useParams()

  return (
    <>
      <h1>Game</h1>
      <p>Game ID: {id}</p>
      {/* Game UI goes here */}
    </>
  )
}