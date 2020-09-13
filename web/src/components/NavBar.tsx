import React from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  const [logoutUser, { loading: logoutLoading }] = useLogoutMutation();
  let body = null;

  if (loading) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={3}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logoutUser();
            await apolloClient.resetStore();
          }}
          isLoading={logoutLoading}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="tomato" p={4}>
      <Box ml="auto" color="white">
        {body}
      </Box>
    </Flex>
  );
};
