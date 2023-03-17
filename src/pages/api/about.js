// local test url: http://localhost:3000/api/about

import { aboutUrl } from "../../lib/global"

export default function handler(req, res) {
    fetch(aboutUrl, {
        method: 'GET'
    })
        .then(response => response.text())
        .then(data => res.status(200).send(data))
}

