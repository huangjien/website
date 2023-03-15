import { createContext } from 'react';

export const userContext = createContext(undefined)
export const settingContext = createContext({})

export async function getSetting() {
    return await fetch(`/api/settings`).then(res => res.json()).then(data => { return data })
}

export async function getUser(username, password) {
    if (window != undefined) {
        var cached = sessionStorage.getItem("currentUser")
        if (cached) {
            console.log(cached)
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