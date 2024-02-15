import Head from 'next/head';
import styles from './layout.module.css';

export const siteTitle = 'Obfuscation Study Prototype';

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </div>
  );
}