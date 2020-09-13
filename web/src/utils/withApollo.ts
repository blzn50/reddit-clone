import { withApollo as createWithApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  // uri: process.env.NEXT_PUBLIC_API_URL as string,
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

export const withApollo = createWithApollo(client);
