import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/study_compass',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    modelUrl: process.env.HUGGINGFACE_MODEL_URL || '',
    sentimentNegativeThreshold: parseFloat(process.env.SENTIMENT_NEGATIVE_CONFIDENCE_THRESHOLD || '0.85'),
  },
};
