import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
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

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    // context: ({req,res}) => ({req, res, redis})
  });

  apolloServer.applyMiddleware({ app });
  app.listen(4000, () => console.log('server listening in port 4000'));
};

main();
