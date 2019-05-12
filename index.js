const puppeteer = require('puppeteer');
const download = require('image-downloader');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const port = 1234;


app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'pug')
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index');
});
app.post('/', (req, res) => {
    console.log(req.body.url);
    main(req.body.url);
    res.send("Successed");
});
async function main(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    if (!fs.existsSync('./result')) {
        fs.mkdirSync('./result');
    }
    const imageSrcSets = await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
        const imgs = Array.from(document.querySelectorAll('article img'));
        const srcAtrribute = imgs.map(i => i.getAttribute('srcset'));
        return srcAtrribute;
    });
    setTimeout(async() => { await browser.close(); }, 5000);

    //  browser.close();
    for (let i = 0; i < imageSrcSets.length; i++) {
        const srcSet = imageSrcSets[i];
        const splitedSrcs = srcSet.split(',');
        const imgSrc = splitedSrcs[splitedSrcs.length - 1].split(' ')[0];
        download({
            url: imgSrc,
            dest: './result'
        });
    }


}
app.listen(port, () => console.log("On port " + port));