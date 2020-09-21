import NextLink from 'next/link';
import { Link, Text, Stack, Heading, Box, Flex, Button, IconButton } from '@chakra-ui/core';
import { Layout } from '../components/Layout';
import { PostsQuery, useDeletePostMutation, usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';
import { UpdootSection } from '../components/UpdootSection';

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 20, cursor: null },
    notifyOnNetworkStatusChange: true,
  });

  const [deletePost] = useDeletePostMutation();

  if (!loading && !data) {
    return <Box>Oops! no posts to show.</Box>;
  }

  return (
    <Layout>
      <br />
      {loading && !data ? (
        <div>Loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex p={5} shadow="md" borderWidth="1px" key={p.id}>
                <UpdootSection post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>Posted by {p.creator.username}</Text>
                  <Flex>
                    <Text flex={1} ml="auto" mt={2}>
                      {p.textSnippet + '...'}
                    </Text>
                    <IconButton mr={3} aria-label="Update Post" icon="edit" />
                    <IconButton
                      variantColor="red"
                      aria-label="Delete Post"
                      icon="delete"
                      onClick={() => {
                        deletePost({
                          variables: {
                            id: p.id,
                          },
                          update: (cache) => {
                            cache.evict({ id: 'Post:' + p.id });
                          },
                        });
                      }}
                    />
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // updateQuery: (previousResult, { fetchMoreResult }): PostsQuery => {
                //   if (!fetchMoreResult) {
                //     return previousResult as PostsQuery;
                //   }

                //   return {
                //     __typename: 'Query',
                //     posts: {
                //       __typename: 'PaginatedPosts',
                //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                //       posts: (previousResult as PostsQuery).posts.posts.concat(
                //         ...(fetchMoreResult as PostsQuery).posts.posts
                //       ),
                //     },
                //   };
                // },
              });
            }}
            isLoading={loading}
            m="auto"
            my={6}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
