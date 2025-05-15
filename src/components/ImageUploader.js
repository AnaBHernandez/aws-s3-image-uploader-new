import React, { useState, useEffect, useCallback } from 'react';
import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand,
  GetObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from '../config/aws-config';
import '../styles/ImageUploader.css';

console.log("Variables de entorno:");
console.log("REGION:", process.env.REACT_APP_AWS_REGION);
console.log("BUCKET:", process.env.REACT_APP_S3_BUCKET);
console.log("ACCESS KEY (primeros 4 caracteres):", process.env.REACT_APP_AWS_ACCESS_KEY ? process.env.REACT_APP_AWS_ACCESS_KEY.substring(0, 4) + "..." : "undefined");
console.log("SECRET KEY (existe):", !!process.env.REACT_APP_AWS_SECRET_KEY);
console.log("SESSION TOKEN (existe):", !!process.env.REACT_APP_AWS_SESSION_TOKEN);

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [newCredentials, setNewCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    sessionToken: ''
  });

  // Crear cliente S3 con credenciales iniciales
  const [s3Client, setS3Client] = useState(new S3Client({
    region: config.region,
    credentials: config.credentials
  }));
  
  // Detectar y manejar errores específicos de credenciales
  const handleCredentialError = (error) => {
    console.error('Error detectado:', error);
    
    if (error.name === 'CredentialsError' || 
        error.name === 'ExpiredTokenException' || 
        error.message.includes('expired') || 
        error.message.includes('credentials')) {
      return 'Las credenciales de AWS han expirado. Por favor, actualiza las credenciales.';
    } else if (error.name === 'AccessDenied' || error.message.includes('Access Denied')) {
      return 'Acceso denegado a S3. Verifica los permisos de tu cuenta AWS.';
    } else {
      return `Error: ${error.message}`;
    }
  };

  // Función para verificar la conexión con AWS
  const checkConnection = async () => {
    setChecking(true);
    setMessage('Verificando conexión con AWS...');
    try {
      const command = new ListObjectsV2Command({
        Bucket: config.bucketName,
        MaxKeys: 1
      });
      
      await s3Client.send(command);
      setMessage('✅ Conexión con AWS exitosa. Las credenciales son válidas.');
      setError('');
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      setError(handleCredentialError(error));
      setMessage('');
    } finally {
      setChecking(false);
    }
  };

  // Función para actualizar las credenciales del cliente S3
  const updateCredentials = () => {
    try {
      const updatedConfig = {
        region: config.region,
        credentials: {
          accessKeyId: newCredentials.accessKeyId || config.credentials.accessKeyId,
          secretAccessKey: newCredentials.secretAccessKey || config.credentials.secretAccessKey,
          sessionToken: newCredentials.sessionToken || config.credentials.sessionToken
        }
      };
      
      // Crear un nuevo cliente con las credenciales actualizadas
      const updatedClient = new S3Client(updatedConfig);
      setS3Client(updatedClient);
      
      // Actualizar la UI
      setMessage('Credenciales actualizadas. Verificando conexión...');
      setShowCredentialsForm(false);
      
      // Limpiar el formulario
      setNewCredentials({
        accessKeyId: '',
        secretAccessKey: '',
        sessionToken: ''
      });
      
      // Verificar la conexión con las nuevas credenciales
      setTimeout(checkConnection, 500);
      
    } catch (error) {
      console.error('Error al actualizar credenciales:', error);
      setError(`Error al actualizar credenciales: ${error.message}`);
    }
  };

  // Función para cargar imágenes con useCallback para evitar recreaciones innecesarias
  const fetchImages = useCallback(async () => {
    try {
      console.log("Intentando conectar con AWS S3...");
      console.log("Bucket:", config.bucketName);
      console.log("Región:", config.region);
      console.log("¿Hay credenciales?", !!config.credentials);
      
      const command = new ListObjectsV2Command({
        Bucket: config.bucketName
      });
      
      const response = await s3Client.send(command);
      console.log("Respuesta de S3:", response);
      
      if (response.Contents) {
        const expiration = 60 * 60; // 1 hora de expiración para URLs firmadas
        const signedUrls = await Promise.all(
          response.Contents.map(async (item) => {
            const command = new GetObjectCommand({
              Bucket: config.bucketName,
              Key: item.Key,
            });
            const url = await getSignedUrl(s3Client, command, { expiresIn: expiration });
            return {
              key: item.Key,
              url: url
            };
          })
        );
        setImages(signedUrls);
      } else {
        setImages([]);
      }
      setError('');
    } catch (error) {
      console.error('Error al cargar la lista de imágenes:', error);
      setError(handleCredentialError(error));
    }
  }, [s3Client]); // Incluir s3Client como dependencia

  // Cargar imágenes cuando el componente se monta o cuando cambia s3Client
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Por favor selecciona un archivo primero.');
      return;
    }

    setUploading(true);
    setMessage('Subiendo imagen...');

    try {
      const fileName = `${Date.now()}-${file.name}`;
      
      const fileReader = new FileReader();
      
      const fileContent = await new Promise((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
      });
      
      const params = {
        Bucket: config.bucketName,
        Key: fileName,
        Body: new Uint8Array(fileContent),
        ContentType: file.type
      };
      
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      fetchImages();
      
      setMessage('¡Imagen subida con éxito!');
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setMessage(handleCredentialError(error));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key) => {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key
      });
      
      await s3Client.send(command);
      
      fetchImages();
      
      setMessage('Imagen eliminada con éxito');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      setMessage(handleCredentialError(error));
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AWS S3 Image Uploader</h1>
      </div>
      
      <div className="upload-section">
        <h2>Subir Imagen a AWS S3</h2>
        <div className="upload-form">
          <label className="file-input-label">
            Seleccionar archivo
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <span className="file-name">{file ? file.name : "Ningún archivo seleccionado"}</span>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-btn"
          >
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </button>
          
          {/* Botón para verificar conexión */}
          <button
            onClick={checkConnection}
            disabled={checking}
            className="check-connection-btn"
          >
            {checking ? 'Verificando...' : 'Verificar Conexión'}
          </button>
        </div>
        
        {message && <div className={`upload-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
        
        <h2>Imágenes Almacenadas</h2>
        
        {error && <div className="upload-message error">{error}</div>}
        
        {images.length === 0 ? (
          <p>No hay imágenes almacenadas.</p>
        ) : (
          <div className="image-grid">
            {images.map((image) => (
              <div key={image.key} className="image-card">
                <img 
                  src={image.url} 
                  alt={image.key}
                  onError={(e) => {
                    console.error(`Error al cargar la imagen ${image.key}`);
                    e.target.src = "https://via.placeholder.com/150x150?text=Error";
                    e.target.style.opacity = 0.5;
                  }}
                />
                <div className="image-card-footer">
                  <button className="delete-btn" onClick={() => handleDelete(image.key)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Botón y formulario para actualizar credenciales */}
        <div className="credentials-section">
          <button 
            className="toggle-credentials-btn"
            onClick={() => setShowCredentialsForm(!showCredentialsForm)}
          >
            {showCredentialsForm ? 'Ocultar Formulario de Credenciales' : 'Actualizar Credenciales'}
          </button>
          
          {showCredentialsForm && (
            <div className="credentials-form">
              <h3>Actualizar Credenciales AWS</h3>
              <div className="form-group">
                <label>Access Key ID</label>
                <input 
                  type="text" 
                  placeholder="Access Key ID" 
                  value={newCredentials.accessKeyId}
                  onChange={(e) => setNewCredentials({...newCredentials, accessKeyId: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Secret Access Key</label>
                <input 
                  type="text" 
                  placeholder="Secret Access Key" 
                  value={newCredentials.secretAccessKey}
                  onChange={(e) => setNewCredentials({...newCredentials, secretAccessKey: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Session Token</label>
                <textarea 
                  placeholder="Session Token" 
                  value={newCredentials.sessionToken}
                  onChange={(e) => setNewCredentials({...newCredentials, sessionToken: e.target.value})}
                />
              </div>
              <button onClick={updateCredentials} className="update-credentials-btn">Actualizar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;