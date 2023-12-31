import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../common/public';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()]
        );
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env['JWT_SECRET'],
            });

            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return (
            request['user'].allowedBuckets.length !== 0 &&
            (typeof request.query.bucketName !== 'string' ||
                request['user'].allowedBuckets.includes(
                    request.query.bucketName
                )) &&
            (typeof request.query.fileName !== 'string' ||
                request.query.fileName.endsWith('.json'))
        );
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] =
            (request.headers as any).authorization?.split(' ') ?? [];

        return type === 'Bearer' ? token : undefined;
    }
}
