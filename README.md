# AWS S3 Image Uploader

## Descripción

Una aplicación **React** que permite subir y gestionar imágenes en **Amazon S3**. Este proyecto demuestra la integración del frontend con servicios de AWS para operaciones básicas de almacenamiento en la nube.

## Funcionalidades

- 📤 Subir imágenes a un bucket de AWS S3  
- 🖼 Vista previa de imágenes antes de subir  
- 🗑️ Eliminar imágenes del bucket S3
- 💡 Interfaz de usuario intuitiva y responsiva  
- ⚠️ Gestión de errores y estados de carga
- 🚀 Despliegue automático con GitHub Actions

## Tecnologías utilizadas

- React  
- AWS SDK para JavaScript v3  
- Amazon S3
- GitHub Actions (CI/CD)
- HTML5 / CSS3  

## Configuración del proyecto

### Prerrequisitos

- Tener **Node.js** y **npm** instalados  
- Contar con una **cuenta de AWS** con acceso a S3  
- Tener un **bucket S3** configurado para la aplicación
- Cuenta de GitHub para el CI/CD

## Configuración

### Variables de Entorno

Para ejecutar este proyecto localmente, necesitarás configurar las variables de entorno:

1. Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`
2. Completa las variables con tus propias credenciales de AWS Academy:

REACT_APP_AWS_REGION=us-west-1
REACT_APP_S3_BUCKET=nombre-de-tu-bucket
REACT_APP_AWS_ACCESS_KEY=tu-access-key
REACT_APP_AWS_SECRET_KEY=tu-secret-key
REACT_APP_AWS_SESSION_TOKEN=tu-session-token

### Configuración de CORS para S3

Para que tu aplicación pueda comunicarse con el bucket S3, necesitas configurar CORS:

```json
[
 {
     "AllowedHeaders": ["*"],
     "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
     "AllowedOrigins": ["*"],
     "ExposeHeaders": ["ETag"]
 }
]