import { withApollo as createWithApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedPosts } from '../generated/graphql';

const client = new ApolloClient({
  // uri: process.env.NEXT_PUBLIC_API_URL as string,
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: [],
            merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts): PaginatedPosts {
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts],
              };
            },
          },
        },
      },
    },
  }),
  credentials: 'include',
});

export const withApollo = createWithApollo(client);
