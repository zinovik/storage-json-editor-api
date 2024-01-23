import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class StorageGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

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
}
