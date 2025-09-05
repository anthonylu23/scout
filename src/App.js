import React from 'react';
import GoogleMap from './GoogleMap';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      margin: 0,
      padding: 0
    }}>
      <GoogleMap />
    </div>
  );
}

export default App;