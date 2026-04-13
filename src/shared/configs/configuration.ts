export default (): any => ({
  env: process.env.APP_ENV,
  port: process.env.APP_PORT,
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },
  jwt: {
    publicKey: Buffer.from(
      process.env.JWT_PUBLIC_KEY_BASE64!,
      'base64',
    ).toString('utf8'),
    privateKey: Buffer.from(
      process.env.JWT_PRIVATE_KEY_BASE64!,
      'base64',
    ).toString('utf8'),
    accessTokenExpiresInSec: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC!,
      10,
    ),
    refreshTokenExpiresInSec: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC!,
      10,
    ),
  },
  defaultAdminUserPassword: process.env.DEFAULT_ADMIN_USER_PASSWORD,
  chapa: {
    baseUrl: process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1',
    publicKey: process.env.CHAPA_PUBLIC_KEY,
    secretKey: process.env.CHAPA_SECRET_KEY,
    encryptionKey: process.env.CHAPA_ENCRYPTION_KEY,
    webhookSecret: process.env.CHAPA_WEBHOOK_SECRET,
    callbackUrl: process.env.CHAPA_CALLBACK_URL,
    returnUrl: process.env.CHAPA_RETURN_URL,
  },
});
