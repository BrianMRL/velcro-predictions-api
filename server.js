require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs-extra');


const app = express();

const TOKENS_FILE = './tokens.json';

async function saveTokens(tokens) {

    await fs.writeJson(TOKENS_FILE, tokens, {
        spaces: 2
    });

}

async function loadTokens() {

    const exists = await fs.pathExists(TOKENS_FILE);

    if (!exists) {
        return null;
    }

    return await fs.readJson(TOKENS_FILE);

}

async function refreshAccessToken() {

    const tokens = await loadTokens();

    if (!tokens?.refresh_token) {
        throw new Error('No refresh token');
    }

    const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
            params: {
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            }
        }
    );

    const newTokens = {

        access_token:
            response.data.access_token,

        refresh_token:
            response.data.refresh_token

    };

    await saveTokens(newTokens);

    console.log('TOKEN RENOVADO 🔥');

    return newTokens.access_token;

}

async function getAccessToken() {

    const tokens = await loadTokens();

    if (!tokens?.access_token) {
        throw new Error('No access token');
    }

    return tokens.access_token;

}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

const accessToken =
    tokenResponse.data.access_token;

const refreshToken =
    tokenResponse.data.refresh_token;

await saveTokens({
    access_token: accessToken,
    refresh_token: refreshToken
});

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

app.get('/me', async (req, res) => {



    
    try {

        const token = await getAccessToken();

        const response = await axios.get(
            'https://api.twitch.tv/helix/users',
            {
                headers: {
                    'Client-ID': process.env.CLIENT_ID,
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.json(error.response?.data || error.message);

    }

});

app.get('/prediction', async (req, res) => {

    try {

        const token = await getAccessToken();

        const response = await axios.get(
            'https://api.twitch.tv/helix/predictions',
            {
                headers: {
                    'Client-ID': process.env.CLIENT_ID,
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    broadcaster_id: '152904113'
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.json(error.response?.data || error.message);

    }

});

app.get('/prediction/live', async (req, res) => {

    try {

        const token = await getAccessToken();

        const response = await axios.get(
            'https://api.twitch.tv/helix/predictions',
            {
                headers: {
                    'Client-ID': process.env.CLIENT_ID,
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    broadcaster_id: '152904113'
                }
            }
        );

        const prediction = response.data.data[0];

        if (!prediction) {
            return res.json({
                active: false
            });
        }

        const outcome1 = prediction.outcomes[0];
        const outcome2 = prediction.outcomes[1];

        res.json({

            active: true,

            title: prediction.title,

            status: prediction.status,

            totalPoints:
                outcome1.channel_points +
                outcome2.channel_points,

            options: [
                {
                    title: outcome1.title,
                    color: outcome1.color,
                    users: outcome1.users,
                    points: outcome1.channel_points,
                    predictors: outcome1.top_predictors || []
                },
                {
                    title: outcome2.title,
                    color: outcome2.color,
                    users: outcome2.users,
                    points: outcome2.channel_points,
                    predictors: outcome2.top_predictors || []
                }
            ]

        });

    } catch (error) {

    const status =
        error.response?.status;

    if (status === 401) {

        console.log(
            'TOKEN EXPIRADO. RENOVANDO...'
        );

        await refreshAccessToken();

        return res.json({
            retry: true
        });

    }

    console.error(
        error.response?.data ||
        error.message
    );

    res.json(
        error.response?.data ||
        error.message
    );

}
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor online en puerto ${PORT}`);
});