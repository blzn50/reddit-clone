import React from 'react';
import { Formik, Form } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Box, Button } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/FormField';
import { useMutation, gql } from '@apollo/client';

interface registerProps {}

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(options: { username: $username, email: $email, password: $password }) {
      errors {
        field
        message
      }
      user {
        id
        username
        email
      }
    }
  }
`;

const Register: React.FC<registerProps> = ({}) => {
  const [registerUser, { data }] = useMutation(REGISTER_MUTATION);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        onSubmit={(values) => {
          console.log('values: ', values);
          return registerUser({ variables: { ...values } });
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
