import { Link as ChakraLink, Text, Code, Icon, List, ListIcon, ListItem } from '@chakra-ui/core';
import { NavBar } from '../components/NavBar';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data } = usePostsQuery();
  return (
    <div>
      <NavBar />
      Hello world
      <br />
      {!data ? <div>Loading</div> : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </div>
  );
};

export default withApollo({ ssr: true })(Index);
