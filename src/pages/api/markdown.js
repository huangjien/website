// local test url: http://localhost:3000/api/about

export const config = {
    api: {
        externalResolver: true,
    },
};

export default function handler(req, res) {
    fetch('https://api.github.com/markdown', {
        method: 'POST',
        headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({ text: req.body })
    })
        .then(response => response.text())
        .then(data => {
            // console.log(data)
            res.status(200).send(data)
        })
}

