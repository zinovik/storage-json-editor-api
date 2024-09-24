import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { JsonGuard } from './json.guard';
import { User } from '../common/user';

@Controller('json')
@UseGuards(new JsonGuard())
export class JsonController {
    constructor(private readonly storageService: StorageService) {}

    @Get()
    async getFile(
        @Query()
        query: { 'bucket-name'?: string; 'file-name'?: string },
        @Req()
        { user }: { user: User }
    ): Promise<{
        bucketNames: string[];
        fileNames: string[];
        file: Object | null;
        user: User;
    }> {
        const { 'bucket-name': bucketName, 'file-name': fileName } = query;

        if (!bucketName && user.allowedBuckets.length === 0) {
            return { bucketNames: [], fileNames: [], file: null, user };
        }

        const currentBucket = bucketName || user.allowedBuckets[0];

        let fileNames;

        if (!fileName) {
            fileNames = (
                await this.storageService.getFileNames(currentBucket)
            ).filter((fileName) => fileName.endsWith('.json'));

            if (fileNames.length === 0)
                return {
                    bucketNames: user.allowedBuckets,
                    fileNames,
                    file: null,
                    user,
                };
        }

        const currentFilename = fileName || fileNames[0];

        const file = await this.storageService.getFile(
            currentBucket,
            currentFilename
        );

        return {
            bucketNames: user.allowedBuckets,
            fileNames,
            file,
            user,
        };
    }

    @Post()
    async saveFile(
        @Body()
        {
            bucketName,
            fileName,
            file,
        }: {
            bucketName: string;
            fileName: string;
            file: Object;
        }
    ): Promise<{ url: string }> {
        return await this.storageService.saveFile(bucketName, fileName, file);
    }
}
