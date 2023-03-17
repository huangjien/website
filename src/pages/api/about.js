// local test url: http://localhost:3000/api/about

export default function handler(req, res) {
    // fetch(aboutUrl, {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `token ${process.env.GITHUB_TOKEN}`
    //     }
    // })
    //     .then(response => response.json())
    //     .then(data => {
    //         // console.log(atob(data.content))
    //         // const content = { "text": atob(data.content) }
    //         var content = { text: "hello" }
    //         fetch('https://api.github.com/markdown', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `token ${process.env.GITHUB_TOKEN}`
    //             },
    //             body: content
    //         })
    //             .then(data => {
    //                 console.log(data)
    //                 res.status(200).send(data);
    //             })
    //     })
    fetch('https://raw.githubusercontent.com/huangjien/huangjien/main/README.md', {
        method: 'GET'
    }).then(response => response.text()).then(data => { res.status(200).send(data) })
}

