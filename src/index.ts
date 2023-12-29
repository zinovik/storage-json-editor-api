import * as functions from '@google-cloud/functions-framework';
import { Main } from './main/Main';
import { GoogleAuthService } from './authorization/GoogleAuth.service';
import { GoogleStorageService } from './storage/GoogleStorage.service';

functions.http('main', async (req, res) => {
    console.log('Triggered!');

    const {
        method,
        headers: { authorization },
        body: { action, payload },
    } = req;

    res.set('Access-Control-Allow-Origin', 'https://zinovik.github.io');

    if (method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }

    if (!authorization) {
        res.status(401).json({ error: 'authorization header is required!' });
        return;
    }

    if (!action) {
        res.status(422).json({ error: 'action is required!' });
        return;
    }

    const main = new Main(new GoogleAuthService(), new GoogleStorageService());

    const response = await main.process(authorization, action, payload);

    console.log('Done!');

    res.status(200).json(response ?? { status: 'success' });
});
