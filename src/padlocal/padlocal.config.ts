import { registerAs } from '@nestjs/config';

export default registerAs('padlocal', () => ({
  assetsBucketName: process.env.PADLOCAL_ASSETS_BUCKET_NAME,
}));
