import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import React, {Fragment} from 'react';

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <header className={utilStyles.header}>
      <h1 className={utilStyles.heading2Xl}>Tasks</h1>
      </header>

      <div className={utilStyles.headingMd}>
        <p>Please choose a task to start:</p>
  
        <p><Link href={{pathname:"/photo-page1"}}>Example Task</Link> </p>

      </div>
    </Layout>
  );
}