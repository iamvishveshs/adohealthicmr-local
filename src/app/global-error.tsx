'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Suppress module resolution errors
  if (error.message?.includes('Cannot find module') || error.message?.includes('.js')) {
    // Silently reload the page
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return null;
    }
  }

  return (
    <html>
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
