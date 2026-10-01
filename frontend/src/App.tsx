import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <section aria-labelledby="react-page-title">
      <h2 id="react-page-title" className="title">React integration</h2>
      <p>React and TypeScript are running inside the Grocy application shell.</p>
      <button type="button" className="btn btn-primary" onClick={() => setCount(count + 1)}>
        Integration check: {count}
      </button>
    </section>
  )
}

export default App
