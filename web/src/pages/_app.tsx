import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import theme from '../theme';

const client = new ApolloClient({
  // uri: process.env.NEXT_PUBLIC_API_URL as string,
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;
