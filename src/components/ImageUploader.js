import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from '../config/aws-config';

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const s3Client = new S3Client({
    region: config.region,
    credentials: config.credentials,
  });

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecciona un archivo primero');
      return;
    }

    setIsUploading(true);
    setMessage('Subiendo archivo...');

    try {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      
      const uploadParams = {
        Bucket: config.bucketName,
        Key: fileName,
        Body: selectedFile,
        ContentType: selectedFile.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      
      const imageUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${fileName}`;
      
      setMessage('¡Imagen subida con éxito!');
      setUploadedImageUrl(imageUrl);
      setSelectedFile(null);
      
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(`Error al subir la imagen: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <h2>Subir Imagen a AWS S3</h2>
      
      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
      
      <div className="upload-controls">
        <input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          accept="image/*"
          disabled={isUploading}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
          className="upload-button"
        >
          {isUploading ? 'Subiendo...' : 'Subir Imagen'}
        </button>
      </div>
      
      {selectedFile && (
        <div className="preview">
          <h3>Vista Previa:</h3>
          <img 
            src={URL.createObjectURL(selectedFile)} 
            alt="Vista previa" 
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
      )}
      
      {uploadedImageUrl && (
        <div className="uploaded-image">
          <h3>Imagen Subida:</h3>
          <img 
            src={uploadedImageUrl} 
            alt="Imagen subida" 
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
          <p>URL: {uploadedImageUrl}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;