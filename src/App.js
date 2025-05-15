import React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS S3 Image Uploader</h1>
      </header>
      <main>
        <ImageUploader />
      </main>
    </div>
  );
}

export default App;