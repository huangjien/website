import { createContext } from 'react';

export const userContext = createContext(undefined)
export const settingContext = createContext({})

export const getSetting = async () => {
    return await fetch('/api/settings', {
        method: 'GET'
    }).then(res => res.json()).then(data => { return data })
}

export const getUser = async (username, password) => {
    if (window != undefined) {
        var cached = sessionStorage.getItem("currentUser")
        if (cached) {
            return await JSON.parse(cached)
        }
    }
    return await fetch('https://api.github.com/users/' + username, {
        method: 'GET',
        headers: {
            'Authorization': 'token ' + password
        }
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
    // .catch(error => {
    //     console.log(error);
    //     return error;
    // }
    // )
}