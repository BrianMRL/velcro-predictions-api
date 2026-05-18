require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Velcro Predictions API Online');
});

app.get('/auth', (req, res) => {

    const clientId = process.env.CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;

    const scopes = [
        'channel:read:predictions'
    ].join(' ');

    const twitchAuthUrl =
        `https://id.twitch.tv/oauth2/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}`;

    res.redirect(twitchAuthUrl);
});

app.get('/callback', async (req, res) => {

    const code = req.query.code;

    res.send(`
        <h1>AUTH EXITOSA</h1>
        <p>Puedes cerrar esta ventana.</p>
        <pre>${code}</pre>
    `);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor online en puerto ${PORT}`);
});