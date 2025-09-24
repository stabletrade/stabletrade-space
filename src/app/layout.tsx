import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import '@/styles/globals.css';
import '@/styles/custom.css';
import '@/styles/customantd.scss';
import { ConfigProvider } from 'antd';
import Layout from '@/Layouts';
import { COLOR_PRIMARY } from '@/constant';

export const metadata: Metadata = {
  title: 'Stable Trade',
  description: 'Just Stable Trade',
};

const MontserratFont = Montserrat({
  subsets: ['vietnamese'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${MontserratFont.variable} font-montserrat`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: COLOR_PRIMARY,
              fontFamily: 'var(--font-archivo)',
            },
          }}
        >
          <Layout>
            {children}
            {/* <GoogleAnalytics gaId='G-5JCE19WNL6' /> */}
          </Layout>
        </ConfigProvider>
      </body>
    </html>
  );
}
