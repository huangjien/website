import { createContext } from 'react';

export const userContext = createContext(undefined)

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
        .catch(error => {
            console.log(error);
            return error;
        }
        )
}