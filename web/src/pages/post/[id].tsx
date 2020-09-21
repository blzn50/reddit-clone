import React from 'react';
import { Box, Heading } from '@chakra-ui/core';
import { Layout } from '../../components/Layout';
import { withApollo } from '../../utils/withApollo';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const { data, loading } = useGetPostFromUrl();

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
      <Box mb={4}>{data?.post.text}</Box>
      <EditDeletePostButtons id={data.post.id} creatorId={data.post.creator.id} />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
