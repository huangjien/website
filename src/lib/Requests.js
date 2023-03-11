
var data = {
    "login": "huangjien",
    "id": 3858628,
    "node_id": "MDQ6VXNlcjM4NTg2Mjg=",
    "avatar_url": "https://avatars.githubusercontent.com/u/3858628?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/huangjien",
    "html_url": "https://github.com/huangjien",
    "followers_url": "https://api.github.com/users/huangjien/followers",
    "following_url": "https://api.github.com/users/huangjien/following{/other_user}",
    "gists_url": "https://api.github.com/users/huangjien/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/huangjien/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/huangjien/subscriptions",
    "organizations_url": "https://api.github.com/users/huangjien/orgs",
    "repos_url": "https://api.github.com/users/huangjien/repos",
    "events_url": "https://api.github.com/users/huangjien/events{/privacy}",
    "received_events_url": "https://api.github.com/users/huangjien/received_events",
    "type": "User",
    "site_admin": false,
    "name": "Jien Huang",
    "company": null,
    "blog": "",
    "location": "Dublin, Ireland",
    "email": "huangjien@gmail.com",
    "hireable": null,
    "bio": null,
    "twitter_username": null,
    "public_repos": 18,
    "public_gists": 0,
    "followers": 1,
    "following": 1,
    "created_at": "2013-03-13T22:29:14Z",
    "updated_at": "2022-12-17T14:29:56Z",
    "private_gists": 0,
    "total_private_repos": 1,
    "owned_private_repos": 1,
    "disk_usage": 149732,
    "collaborators": 0,
    "two_factor_authentication": true,
    "plan": {
        "name": "free",
        "space": 976562499,
        "collaborators": 0,
        "private_repos": 10000
    }
}

export async function getUser(username, password) {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, 1000);
    });
}