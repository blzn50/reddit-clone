import React from 'react';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
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
      <Flex align="center" color="#ffffdc">
        <NextLink href="/create-post">
          <Button variant="link" color="#ffffdc">
            Create post
          </Button>
        </NextLink>
        <Box mx={3}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logoutUser();
            await apolloClient.resetStore();
          }}
          isLoading={logoutLoading}
          variant="link"
          color="#ffffdc"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex position="sticky" top={0} bg="tomato" p={4} zIndex={1}>
      <Flex flex={1} m="auto" maxW={800} align="center">
        <NextLink href="/">
          <Link>
            <Heading size="md" color="#ffffdc">
              Mini Reddit
            </Heading>
          </Link>
        </NextLink>
        <Box ml="auto" color="white">
          {body}
        </Box>
      </Flex>
    </Flex>
  );
};
