import Express from "express";
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
config();
const app = Express();
const dir = process.env.FILE_DIR;

const getFiles = () => fs.readdirSync(dir);

let tokens = [];

app.use((req, res, next) => {
    const url = req.url;
    if (!url.startsWith("/a")) {
        const t = url.split("/")[url.split("/").length - 1];
        console.log(t);
        tokens.includes(t) ? next() : res.sendStatus(401);
        const i = tokens.indexOf(t);
        if (i > -1) console.log(`Token '${tokens.splice(i, 1)}' used`);
    } else next();
});

app.get("/a/tokens", (req, res) => {
    const pass = req.headers.authorization;
    if (pass === process.env.PASS) {
        res.send(tokens.length >= 1 ? tokens.map((t) => `${t}`) : "no tokens");
    } else res.sendStatus(404);
});

app.get("/list/*", (req, res) => {
    const files = getFiles();
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File list</title>
    <style>body{font-family:"Courier New",Courier,monospace;font-weight:900;font-size: xx-large;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#090909}body,html{margin:0;padding:0;width:100%;height:100%}a{color:#000;background-color:#f5f5f5;padding:5px;text-decoration:none}</style>
    </head>
    <body>
        ${files.map((f) => `<a href="/d/${f}">${f}</a>`)}
    </body>
</html>`);
});

app.post("/a/newtoken/:token?", (req, res) => {
    const pass = req.headers.authorization;
    const token = req.params.token;
    if (pass === process.env.PASS) {
        let t = token ? token : (Math.random() * 10).toString(16).substring(3);
        tokens.includes(t)
            ? (t = `Token '${token}' is already used, here is another random token: ${(Math.random() * 10).toString(16).substring(3)}`)
            : null;
        tokens.push(t);
        console.log(t);
        // setTimeout(() => {
        //     const i = tokens.indexOf(t);
        //     if (i > -1) console.log(`Token '${tokens.splice(i, 1)}' timed out`);
        // }, 10000);
        res.send(t);
    } else res.sendStatus(404);
});

app.get("/:file/*", (req, res) => {
    const file = req.params.file;
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file}</title>
    <style>body{font-family:"Courier New",Courier,monospace;font-weight:900;font-size: xx-large;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#090909}body,html{margin:0;padding:0;width:100%;height:100%}a{color:#000;background-color:#f5f5f5;padding:5px;text-decoration:none}</style>
    </head>
    <body>
        <a href="/d/${file}">${file}</a>
    </body>
</html>`);
});

app.get("/d/:file/*", (req, res) => {
    const file = req.params.file;
    const files = getFiles();
    files.forEach((f) => (f == file ? res.download(path.join(dir, f)) : null));
});

app.listen(process.env.PORT, () => console.log(`app listening on port ${process.env.PORT}`));
