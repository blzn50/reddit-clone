import React from 'react';
import { Formik, Form } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Box, Button } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/FormField';
import { useMutation, gql } from '@apollo/client';
import { useRegisterMutation } from '../generated/graphql';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const [registerUser, { data }] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          console.log('values: ', values);
          const response = await registerUser({ variables: { ...values } });

          if (response.data?.register.errors) {
            setErrors({ username: 'There is errror' });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" label="Username" placeholder="username..." />
            <Box mt={4}>
              <InputField
                type="password"
                name="password"
                label="Password"
                placeholder="password..."
              />
            </Box>
            <Box mt={4}>
              <InputField type="email" name="email" label="Email" placeholder="email..." />
            </Box>
            <Button mt={4} type="submit" variantColor="teal" isLoading={isSubmitting}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
