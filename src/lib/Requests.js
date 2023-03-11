

export async function getUser(username, password) {
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