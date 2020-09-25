declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDISCLOUD_URL: string;
    SESSION_SECRET: string;
    SENDGRID_KEY: string;
    PORT: string;
    CORS_ORIGIN: string;
    CORS_ORIGIN2: string;
  }
}
