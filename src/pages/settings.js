import { useUpdateEffect } from 'ahooks';
import { useRouter } from 'next/navigation';
import HTable from '../components/HTable';
import Layout from '../components/layout/Layout';
import { useAuth } from '../lib/useAuth';
import { useSettings } from '../lib/useSettings';

const Settings = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
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
    if (!user) {
      push('/');
    }
  }, [user]);

  return (
    <Layout>{user && <HTable columns={columns} data={settings} />}</Layout>
  );
};
export default Settings;
