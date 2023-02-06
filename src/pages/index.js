
import { Inter } from '@next/font/google';
import Layout from '../components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

// export default function Home() {
//   return (
//     <>
//       <Layout>
//         <p>Hello, My blog</p>
//       </Layout>
//     </>
//   );
// }

const Index = () => (
  <Layout>
    <p>Hello, My blog</p>
  </Layout>
)
export default Index;
