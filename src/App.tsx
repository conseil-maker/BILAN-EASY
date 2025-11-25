function App() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>✅ React fonctionne !</h1>
      <p>Si vous voyez ce message, React est correctement chargé.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}

export default App;
