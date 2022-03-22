import React from 'react';
import Head from 'next/head';
import { Typography } from 'antd';

import { AppLayout } from 'components/AppLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage(props: { body: string }) {
  return (
    <AppLayout>
      <Head>
        <title>NextJS Boilerplate</title>
      </Head>
      <Title level={2}>NextJS Boilerplate</Title>
      <Paragraph>This boilerplate uses Ant Design and Tailwindcss.</Paragraph>
    </AppLayout>
  );
}
