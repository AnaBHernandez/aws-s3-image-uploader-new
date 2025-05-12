import React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';
import './ImageUploader.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS S3 Image Uploader</h1>
      </header>
      <main>
        <ImageUploader />
      </main>
      <footer>
        <p>React + AWS S3 Integration</p>
      </footer>
    </div>
  );
}

export default App;