
export const config = {
    api: {
        externalResolver: true,
    },
};

const b64toBlob = (base64, type = 'audio/webm') =>
    fetch(`data:${type};base64,${base64}`).then(res => { return res.blob() })

function createFormDataFromBase64(base64String, fieldName, fileName) {
    const byteString = atob(base64String.split(',')[1]);
    const mimeType = 'audio/webm';

    // eslint-disable-next-line no-undef
    const arrayBuffer = new ArrayBuffer(byteString.length);
    // eslint-disable-next-line no-undef
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i += 1) {
        intArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([intArray], { type: mimeType });

    const formData = new FormData();
    formData.append(fieldName, blob, fileName);

    return formData;
}

const audioBlobFromBase64String = base64String => {
    // eslint-disable-next-line no-undef
    const byteArray = Uint8Array.from(
        decodeURIComponent(atob(base64String))
            .split('')
            .map(char => char.charCodeAt(0))
    );
    return new Blob([byteArray], { type: 'audio/webm' });
};


export default async function handler(req, res) {
    if (req.method !== "POST") {
        return;
    }
    // console.log(req.body)
    // setTimeout(() => {
    //     console.log('wait 1s!');
    // }, 1000);
    // const b64 = audioBlobFromBase64String(req.body)
    // await b64toBlob(req.body).then(b64Audio => {
    //     console.log(req.body)
    const formData = new FormData()
    formData.append("file", req.body)
    formData.append("model", "whisper-1")
    formData.append("language", "en")
    // formData.append("model", "whisper-1")
    await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`,
        },
        body: formData
    }).then(data => { console.log(data); res.status(200).send(data) })
        .catch(err => { console.log(err) });
    // })




    // res.status(200).send(data)
}
