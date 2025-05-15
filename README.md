# AWS S3 Image Uploader

## Descripción

Una aplicación **React** que permite subir y gestionar imágenes en **Amazon S3**. Este proyecto demuestra la integración del frontend con servicios de AWS para operaciones básicas de almacenamiento en la nube.

## Funcionalidades

- 📤 Subir imágenes a un bucket de AWS S3  
- 🖼 Vista previa de imágenes antes de subir  
- 💡 Interfaz de usuario intuitiva y responsiva  
- ⚠️ Gestión de errores y estados de carga  

## Tecnologías utilizadas

- React  
- AWS SDK para JavaScript v3  
- Amazon S3  
- HTML5 / CSS3  

## Configuración del proyecto

### Prerrequisitos

- Tener **Node.js** y **npm** instalados  
- Contar con una **cuenta de AWS** con acceso a S3  
- Tener un **bucket S3** configurado para la aplicación  

## Configuración

Para ejecutar este proyecto, necesitarás configurar las credenciales de AWS:

1. Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`
2. Completa las variables con tus propias credenciales de AWS
3. Asegúrate de no compartir tu archivo `.env` en control de versiones

## Mantenimiento de Credenciales en AWS Academy

Las credenciales en entornos educativos de AWS Academy son temporales y expiran cada 1-12 horas. Para mantener la aplicación funcionando:

### Actualización manual de credenciales

1. Accede al portal de AWS Academy
2. Ve a la sección "AWS Details" para ver tus credenciales temporales
3. Actualiza estas credenciales en el archivo `src/config/aws-config.js`
4. Reinicia tu aplicación o vuelve a generar el build si es necesario

### Despliegue en S3

Para desplegar la aplicación en S3 después de actualizar credenciales:

1. Genera la versión de producción:

## Configuración de Variables de Entorno

Para ejecutar este proyecto, necesitarás configurar variables de entorno:

1. Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`
2. Completa las variables con tus propias credenciales de AWS Academy
3. Las credenciales de AWS Academy son temporales y deben actualizarse regularmente (cada 1-12 horas)