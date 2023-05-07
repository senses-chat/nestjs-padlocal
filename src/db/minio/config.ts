import { registerAs } from '@nestjs/config';
export default registerAs('minio', () => ({
  options: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
    secretKey: process.env.MINIO_SECRET_KEY || 'minio123',
    region: process.env.MINIO_REGION || 'us-east-1',
  },
  bucketName: process.env.BUCKET_NAME || 'padlocal',
}));
