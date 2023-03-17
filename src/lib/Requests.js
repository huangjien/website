import { createContext } from 'react';
import { currentUser } from '../lib/global';

export const userContext = createContext(undefined)
export const settingContext = createContext({})

export const getSetting = async () => {
    return await fetch('/api/settings', {
        method: 'GET'
    }).then(res => res.json()).then(data => { return data })
}

export const getMarkDownHtml = async (content) => {
    return await fetch('/api/markdown', {
        method: 'POST',
        body: content
    })
        .then(res => res.text())
        .then(data => { return (data) })
}

export const getReadme = async () => {
    return await fetch('/api/about', {
        method: 'GET'
    }).then(res => { return res.text() })
}


export const getUser = async (username, password) => {
    if (window != undefined) {
        var cached = sessionStorage.getItem(currentUser)
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
}