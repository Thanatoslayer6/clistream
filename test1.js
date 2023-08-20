const CryptoJS = require('crypto-js');
const axios = require('axios');

let encryptedURL = 'U2FsdGVkX192Y4j5j3OCAZf1yP1A6nFJb8CGV40gnQCvMGPOkkHvc7qpvDNErjwG1vqQpntvQV7NPun3FM9SdbnVwlr+ptHjaWbQYRVuCIkB0hSH4PIV0Ga9bbkoQtNE6cHya/xoaVerpvKzl9hy5O4cEpRiUYZRcv7kBMugXEt5q782tt2DesqOFxUClmYpqYpkHGTqjdEfAZqg2WCcq3inMtDTOBGzcdRHXLXmvqvO1NuDimNKrMV3FuvJXaLaB0uyNv5zopPdYHwrq3IJOI2OhCXRrrcgYZmiC46ZnXYPBJI+jitzjujRr49ed3Q4osiQz7V2WiRmGTl3+mtBWE8JGsWGw1eRD0aFxxALmsHQMGJfV+mI5f9KoXaxXASxUrAw28gCZyC4gmGWmjM1FtAGM+IGJkzA4Pic1OYMDCjAp4jmaquwtYor+d5IGf36DkLR+i2kTo0AJRVOiopAjq+QUlAKgjywyARkce/Wl/thjWuSll/4HDaoROCwIodzzllf0eCGjUCRnC+vFzkGypyxsPGcQX4MlNr9kcy/0mvHW+z'

const getLatestKey = async () => {
    let key = (await axios.get('https://raw.githubusercontent.com/enimax-anime/key/e4/key.txt')).data
    console.log(key)
    return key;
}

;(async () => {
    let decryptKey = await getLatestKey();
    let encryptedURLTemp = encryptedURL.split("");
    let key = "";

    for (const index of decryptKey) {
        for (let i = index[0]; i < index[1]; i++) {
            key += encryptedURLTemp[i];
            encryptedURLTemp[i] = null;
        }
    }

    decryptKey = key;
    encryptedURL = encryptedURLTemp.filter((x) => x !== null).join("");
    console.log(encryptedURL, decryptKey);
    let decryptedSource = JSON.parse(CryptoJS.AES.decrypt(encryptedURL, decryptKey).toString(CryptoJS.enc.Utf8));
    console.log(decryptedSource);

})()
