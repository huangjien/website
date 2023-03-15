import { Text } from '@nextui-org/react';
import { useContext } from 'react';
import Layout from '../components/layout/Layout';
import { settingContext, userContext } from '../lib/Requests';

const Settings = () => {
    const [setting] = useContext(settingContext)
    const [data] = useContext(userContext)

    return (
        <Layout>
            {!data && <Text color="error">Please log in</Text>}
            {data && <pre>{setting}</pre>}
        </Layout>
    )
}
export default Settings