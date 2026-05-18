require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

    try {

        const code = req.query.code;

        if (!code) {
            return res.send('No se recibió code de Twitch');
        }

        const tokenResponse = await axios.post(
            'https://id.twitch.tv/oauth2/token',
            null,
            {
                params: {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: process.env.REDIRECT_URI
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        console.log('ACCESS TOKEN:', accessToken);

        res.send(`
            <h1>AUTH EXITOSA 🔥</h1>
            <p>Twitch conectado correctamente.</p>
        `);

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.send(`
            <h1>Error OAuth</h1>
            <pre>${JSON.stringify(error.response?.data, null, 2)}</pre>
        `);
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor online en puerto ${PORT}`);
});