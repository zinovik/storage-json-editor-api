import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Body,
    UseGuards,
    Get,
    Request,
} from '@nestjs/common';
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
    login(@Body() { token }: { token: string }) {
        return this.authService.signIn(token);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: { user: User }) {
        return req.user;
    }
}
