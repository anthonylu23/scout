import React from 'react';
import { Navbar, MapView } from './components';
import ErrorBoundary from './components/UI/ErrorBoundary';
import './styles';

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;