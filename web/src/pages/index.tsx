import NextLink from 'next/link';
import { Link, Text, Code, Icon, List, ListIcon, ListItem } from '@chakra-ui/core';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data } = usePostsQuery();
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create post</Link>
      </NextLink>
      <br />
      {!data ? <div>Loading</div> : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
