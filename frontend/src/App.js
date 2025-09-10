import React from 'react';
import { Navbar, MapView } from './components';
import './styles';

function App() {
  return (
    <div style={{ 
      height: '100vh', 
      maxHeight: '100vh',
      backgroundColor: '#f5f5f5',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MapView />
      <Navbar />
    </div>
  );
}

export default App;