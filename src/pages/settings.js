import { useUpdateEffect } from 'ahooks';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import HTable from '../components/HTable';
import Layout from '../components/layout/Layout';
import { useAuth } from '../lib/useAuth';
import { useSettings } from '../lib/useSettings';

const Settings = () => {
  const { settings } = useSettings();
  const { user, isAdmin } = useAuth();
  const { push } = useRouter();
  const { t } = useTranslation();
  const columns = [
    {
      key: 'name',
      label: t('column.title.key'),
    },
    {
      key: 'value',
      label: t('column.title.value'),
    },
  ];

  // protect this page when user suddenly logout
  useUpdateEffect(() => {
    if (!isAdmin) {
      push('/');
    }
  }, [user]);

  return (
    <Layout>{user && <HTable columns={columns} data={settings} />}</Layout>
  );
};
export default Settings;
