import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';

import { REDIS_CONN, SESSION_SECRET, COOKIE_NAME } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'reddit-clone',
    username: 'postgres',
    password: 'admin',
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const redisStore = connectRedis(session);
  const redisClient = redis.createClient({ url: REDIS_CONN });

  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new redisStore({ client: redisClient }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        sameSite: 'lax', // csrf
        // secure: true
      },
      saveUninitialized: false,
      secret: SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => console.log('server listening in port 4000'));
};

main();
