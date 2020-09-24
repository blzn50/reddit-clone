declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL : string;
    SESSION_SECRET: string;
    SENDGRID_KEY: string;
    PORT: string;
    CORS_ORIGIN: string;
  }
}
