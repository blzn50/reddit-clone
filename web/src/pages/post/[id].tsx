import React from 'react';
import { Box, Heading } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const router = useRouter();
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>No post found.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>{data?.post.title}</Heading>
      <Box>{data?.post.text}</Box>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
