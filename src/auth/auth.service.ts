import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

const CLIENT_ID =
    '306312319198-u9h4e07khciuet8hnj00b8fvmq25rlj0.apps.googleusercontent.com';

@Injectable()
export class AuthService {
    private readonly client = new OAuth2Client();

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(token: string): Promise<{ access_token: string }> {
        let ticket: LoginTicket;

        try {
            ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
        } catch (error) {
            throw new UnauthorizedException();
        }

        const payload = ticket.getPayload();

        const user = await this.usersService.findOne(payload.email);

        return {
            access_token: await this.jwtService.signAsync({
                email: user.email,
                allowedBuckets: user.allowedBuckets,
                isGalleryAccess: user.isGalleryAccess,
            }),
        };
    }
}
