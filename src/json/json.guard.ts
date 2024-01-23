import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JsonGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        return (
            request['user'].allowedBuckets.length !== 0 &&
            (typeof request.body.bucketName !== 'string' ||
                request['user'].allowedBuckets.includes(
                    request.body.bucketName
                )) &&
            (typeof request.body.fileName !== 'string' ||
                request.body.fileName.endsWith('.json'))
        );
    }
}
