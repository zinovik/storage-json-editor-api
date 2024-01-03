import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
} from '@nestjs/common';
import { AuthorizationService } from './authorization/authorization.interface';

const ALLOWED_BUCKETS: Record<string, string[]> = {
    'zinovik@gmail.com': [
        'hedgehogs',
        'digital-board-games',
        'zinovik-gallery',
    ],
    'puchochek@gmail.com': ['hedgehogs'],
};

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject()
        private readonly authorizationService: AuthorizationService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if (!request.headers.authorization) return false;

        const email = await this.authorizationService.verify(
            request.headers.authorization
        );

        const allowedBuckets = ALLOWED_BUCKETS[email] || [];

        request.allowedBuckets = allowedBuckets;

        return (
            allowedBuckets.length !== 0 &&
            (typeof request.query.bucketName !== 'string' ||
                allowedBuckets.includes(request.query.bucketName)) &&
            (typeof request.query.fileName !== 'string' ||
                request.query.fileName.endsWith('.json'))
        );
    }
}
