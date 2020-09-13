import { Link as ChakraLink, Text, Code, Icon, List, ListIcon, ListItem } from '@chakra-ui/core';
import { NavBar } from '../components/NavBar';
import { withApollo } from '../utils/withApollo';

const Index = () => (
  <div>
    <NavBar />
    Hello world
  </div>
);

export default withApollo({ ssr: true })(Index);
