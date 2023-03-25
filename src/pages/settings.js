import { Text } from '@nextui-org/react';
import { useContext } from 'react';
import HTable from '../components/HTable';
import Layout from '../components/layout/Layout';
import { settingContext, userContext } from '../lib/Requests';


const Settings = () => {
    const [setting] = useContext(settingContext)
    const [data] = useContext(userContext)
    const columns = [
        {
            key: "name",
            label: "NAME",
        },
        {
            key: "value",
            label: "VALUE",
        },
    ]

    return (
        <Layout>
            {!data && <Text color="error">Please log in</Text>}
            {data && <HTable columns={columns} data={setting} />}
        </Layout>
    )
}
export default Settings