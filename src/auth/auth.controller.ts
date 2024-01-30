import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Body,
    UseGuards,
    Get,
    Request,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { User } from '../common/user';
import { Public } from '../common/public';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Res({ passthrough: true }) response: Response,
        @Body() { token }: { token: string }
    ) {
        const { access_token } = await this.authService.signIn(token);

        response.cookie('access_token', access_token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            domain: 'zinovik.github.io',
        });

        return { access_token };
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: { user: User }) {
        return req.user;
    }
}
