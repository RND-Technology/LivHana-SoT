import { useState } from 'react'
import { VideoPlayerWithCommerce } from './components/VideoPlayer'

function App() {
  const [customerId] = useState('demo-customer-001')
  const [episodeId] = useState('demo-episode')

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Liv Hana - Video Commerce Prototype</h1>
        <p style={styles.subtitle}>Content meets Commerce: Interactive product placements</p>
      </header>

      <main style={styles.main}>
        <VideoPlayerWithCommerce
          customerId={customerId}
          episodeId={episodeId}
          apiBaseUrl="/api"
        />
      </main>

      <footer style={styles.footer}>
        <p>Prototype 4: Video Commerce UI - Built with React + TypeScript + Vite</p>
      </footer>
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
  },
  header: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold' as const,
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '18px',
    margin: 0,
    opacity: 0.9,
  },
  main: {
    padding: '20px',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#666',
    fontSize: '14px',
  },
}

export default App
