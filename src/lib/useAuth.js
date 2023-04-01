import { useRequest, useSessionStorageState } from "ahooks";
import { createContext, useContext, useState } from "react";
import { getUser } from './Requests';
import { useSettings } from './useSettings';

const currentUser = 'currentUser'
const authContext = createContext();

export function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
    return useContext(authContext);
};

function useProvideAuth() {
    const { getSetting } = useSettings();
    const [user, setUser] = useSessionStorageState(currentUser);
    const { loading, run } = useRequest(getUser, {
        manual: true,
        debounceWait: 300,
        throttleWait: 300,
        onSuccess: (result) => {
            if (!result.message) {
                // we got login info here, now we will handle it according setting
                var userInfoSetting = getSetting('user.info');
                var userOneInfo = userInfoSetting.split(',');
                var userInfo = {};
                userOneInfo.forEach((element) => {
                    userInfo[element] = result[element];
                });
                setUser(userInfo);
                setError(undefined);
            } else {
                setError(result.message);
            }
        },
        onError: (error) => {
            console.log(error);
        },
        cacheKey: currentUser,
    });
    const [error, setError] = useState(null);


    function login(username, token) {
        run(username, token)
    }

    function logout() {
        setUser(undefined)
    }

    function isAuthenticated() {
        return user !== undefined;
    }

    function isAdmin() {
        return user && user.role === 'admin';
    }


    return { loading, user, login, logout, error }

}