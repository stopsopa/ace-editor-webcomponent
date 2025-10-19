import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import serveIndex from 'serve-index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = (function(){try{return console.log}catch(e){return function (){}}}());

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const web = path.resolve(__dirname);

const app = express();

app.use(cookieParser());

app.use(express.urlencoded({extended: false}));

app.use(express.json());

// Simple health check endpoint (from existing implementation)
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.use(express.static(web, {
    index: false, // stop automatically serve index.html if present
    maxAge: '1 day', // cache for development
}), serveIndex(web, {
    icons: true,
    view: "details",
    hidden: false,
}));

app.listen(port, host, () => {
    log(`\n 🌎  Server is running http://${host}:${port}\n`);
});
