import { Box, Link, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../components/FormField';
import { Wrapper } from '../components/Wrapper';
import { useChangePasswordMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '', confirmPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          console.log('values: ', values);
          // const response = await changePassword({
          //   variables: {
          //     token,
          //     newPassword: values.newPassword,
          //     confirmPassword: values.confirmPassword,
          //   },
          // });
          // if (response.data?.changePassword.errors) {
          //   const errorMap = toErrorMap(response.data?.changePassword.errors);
          //   if ('token' in errorMap) {
          //     setTokenError(errorMap.token);
          //   }
          //   setErrors(errorMap);
          // } else if (response.data?.changePassword.user) {
          //   router.push('/');
          // }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField type="email" name="email" label="Email" placeholder="Email" />

            <Button mt={4} type="submit" variantColor="teal" isLoading={isSubmitting}>
              Get a new password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
