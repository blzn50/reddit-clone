import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React from 'react';
import { useRouter } from 'next/router';
import { InputField } from '../../../components/FormField';
import { Layout } from '../../../components/Layout';
import { withApollo } from '../../../utils/withApollo';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost: React.FC = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = useGetPostFromUrl();
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>No post found.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          console.log('values: ', values);
          const { errors } = await updatePost({
            variables: { id: intId, ...values },
            update: (cache) => {
              cache.evict({ fieldName: 'posts:{}' });
            },
          });

          if (!errors) {
            router.back();
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" placeholder="Title..." />
            <Box mt={4}>
              <InputField textarea name="text" label="Body" placeholder="text..." />
            </Box>
            <Button mt={4} type="submit" variantColor="teal" isLoading={isSubmitting}>
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);
