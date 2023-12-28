import { OAuth2Client } from 'google-auth-library';
import { Authorization } from './Authorization.interface';

const CLIENT_ID =
    '306312319198-u9h4e07khciuet8hnj00b8fvmq25rlj0.apps.googleusercontent.com';

export class GoogleAuthService implements Authorization {
    private readonly client;

    constructor() {
        this.client = new OAuth2Client();
    }

    async verify(token: string): Promise<string> {
        const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();

        return payload.email;
    }
}
