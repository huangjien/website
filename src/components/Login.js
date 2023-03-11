
import { Avatar, Button, Input, Loading, Modal, Text } from '@nextui-org/react';
import { useRequest } from 'ahooks';
import React, { useEffect } from 'react';
import { getUser } from '../lib/Requests';

const Login = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [data, setData] = React.useState(null);
    const { loading, run } = useRequest(getUser, {
        manual: true, debounceWait: 300, throttleWait: 300,
        onSuccess: (result) => {
            setData(result);
        },
        onError: (error) => {
            console.log(error);
        },
        cacheKey: 'currentUser', staleTime: 1000 * 60 * 5
    });
    const [visible, setVisible] = React.useState(false);
    const handler = () => setVisible(true);

    const closeHandler = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (data) {
            setVisible(false)
        }
    }, [data]);

    return (
        <>
            {!data && <Button auto shadow onPress={handler}>Login</Button>}
            {loading ? <Loading /> :
                data && data.avatar_url ?
                    data && <Avatar squared text={data.name} src={data.avatar_url} /> :
                    data && <Text href="#"> {data.name} </Text>}
            <Modal
                closeButton
                blur
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={18}>
                        Please enter your Github user name and token
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Input aria-label="Github User Name"
                        clearable
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        placeholder="Github User Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input aria-label="Github Token"
                        clearable
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        placeholder="Github Token"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Close
                    </Button>
                    <Button auto onPress={() => run(username, password)}>
                        {/* <Button auto onClick={closeHandler}> */}
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    )
}

export default Login;