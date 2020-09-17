import NextLink from 'next/link';
import { Link, Text, Stack, Heading, Box, Flex, Button } from '@chakra-ui/core';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, loading } = usePostsQuery({
    variables: { limit: 10 },
  });

  if (!loading && !data) {
    return <Box>Oops! no posts to show.</Box>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>MiniReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>
      <br />
      {loading && !data ? (
        <div>Loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.map((p) => (
            <Box p={5} shadow="md" borderWidth="1px" key={p.id}>
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={2}>{p.textSnippet + '...'}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && (
        <Flex>
          <Button isLoading={loading} m="auto" my={6}>
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
