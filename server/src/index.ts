import 'reflect-metadata';
import 'dotenv-safe/config';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { Updoot } from './entities/Updoot';
import { User } from './entities/User';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { COOKIE_NAME, __prod__ } from './constants';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User, Post, Updoot],
  });
  await conn.runMigrations();

  const redisStore = connectRedis(session);
  const redis = new Redis(process.env.REDISCLOUD_URL);

  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new redisStore({ client: redis }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        sameSite: 'none', // csrf
        secure: __prod__,
        domain: __prod__ ? 'vercel.app' : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(parseInt(process.env.PORT), () =>
    console.log('server listening in port ' + process.env.PORT)
  );
};

main();
