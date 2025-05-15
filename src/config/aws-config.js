const config = {
  region: process.env.REACT_APP_AWS_REGION || 'us-west-1',
  bucketName: process.env.REACT_APP_S3_BUCKET || 'factoriaf5.anabelen.fase1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY || '',
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN || ''
  }
};

export default config;