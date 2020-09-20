import React, { useState } from 'react';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { InputField } from '../../components/FormField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { MeDocument, MeQuery, useChangePasswordMutation } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '', confirmPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          console.log('values: ', values);
          const response = await changePassword({
            variables: {
              token: typeof router.query.token === 'string' ? router.query.token : '',
              newPassword: values.newPassword,
              confirmPassword: values.confirmPassword,
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              });
            },
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data?.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {tokenError ? (
              <Flex>
                <Box mr={4} style={{ color: 'red' }}>
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>Request new password link</Link>
                </NextLink>
              </Flex>
            ) : null}
            <InputField
              type="password"
              name="newPassword"
              label="New Password"
              placeholder="New Password"
            />
            <Box mt={4}>
              <InputField
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm Password"
              />
            </Box>

            <Button mt={4} type="submit" variantColor="teal" isLoading={isSubmitting}>
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
