import React, { useState } from 'react';
import NextLink from 'next/link';
import { Box, Link, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { InputField } from '../components/FormField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          console.log('values: ', values);
          await forgotPassword({
            variables: {
              email: values.email,
            },
          });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <>
              <Box>If the account exists, you will get an email.</Box>
              <NextLink href="/login">
                <Link>Go to login page</Link>
              </NextLink>
            </>
          ) : (
            <>
              <Form>
                <Box as="h2" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  Forgot password
                </Box>
                <Box as="em">
                  Input your email address to receive a password reset link in your inbox.
                </Box>
                <InputField type="email" name="email" label="Email" placeholder="Your email..." />

                <Button mt={4} type="submit" variantColor="teal" isLoading={isSubmitting}>
                  Request a new password
                </Button>
              </Form>
            </>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
