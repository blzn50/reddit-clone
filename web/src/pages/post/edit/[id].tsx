import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { InputField } from '../../../components/FormField';
import { Layout } from '../../../components/Layout';
import { withApollo } from '../../../utils/withApollo';
import { useMeQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useIsAuth } from '../../../utils/useIsAuth';

const EditPost: React.FC = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = useGetPostFromUrl();
  const { data: meData } = useMeQuery();
  const [updatePost] = useUpdatePostMutation();
  useIsAuth();

  useEffect(() => {
    if (meData?.me?.id !== data?.post?.creator.id) {
      router.push('/');
    }
  });

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );
  }

  if (!data.post) {
    return (
      <Layout>
        <Box>No post found.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Formik
        initialValues={{ title: data?.post.title, text: data?.post.text }}
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
