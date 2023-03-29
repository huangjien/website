import { useUpdateEffect } from 'ahooks';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import HTable from '../components/HTable';
import Layout from '../components/layout/Layout';
import { settingContext, userContext } from '../lib/Requests';

const Settings = () => {
  const [setting] = useContext(settingContext);
  const [data] = useContext(userContext);
  const { push } = useRouter();
  const columns = [
    {
      key: 'name',
      label: 'NAME',
    },
    {
      key: 'value',
      label: 'VALUE',
    },
  ];

  // protect this page when user suddenly logout
  useUpdateEffect(() => {
    if (!data) {
      push('/')
    }
  }, [data])

  return (
    <Layout>
      {data && <HTable columns={columns} data={setting} />}
    </Layout>
  );
};
export default Settings;
