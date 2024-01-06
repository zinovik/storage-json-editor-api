import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { GoogleStorageService } from './storage/google-storage.service';
import { AuthGuard } from './auth.guard';
import { GoogleAuthService } from './authorization/google-auth.service';

@Controller()
@UseGuards(new AuthGuard(new GoogleAuthService()))
export class StorageJsonEditorController {
    constructor(private readonly storageService: GoogleStorageService) {}

    @Get('file')
    async getFile(
        @Query()
        query: { 'bucket-name'?: string; 'file-name'?: string },
        @Req() { allowedBuckets }: { allowedBuckets: string[] }
    ): Promise<{
        bucketNames: string[];
        fileNames: string[];
        file: string | null;
    }> {
        const { 'bucket-name': bucketName, 'file-name': fileName } = query;

        let bucketNames;

        if (!bucketName) {
            bucketNames = (await this.storageService.getBucketNames()).filter(
                (bucketName) => allowedBuckets.includes(bucketName)
            );

            if (bucketNames.length === 0)
                return { bucketNames, fileNames: [], file: null };
        }

        const currentBucket = bucketName || bucketNames[0];

        let fileNames;

        if (!fileName) {
            fileNames = (
                await this.storageService.getFileNames(currentBucket)
            ).filter((fileName) => fileName.endsWith('.json'));

            if (fileNames.length === 0)
                return { bucketNames, fileNames, file: null };
        }

        const currentFilename = fileName || fileNames[0];

        const file = await this.storageService.getFile(
            currentBucket,
            currentFilename
        );

        return {
            bucketNames,
            fileNames,
            file,
        };
    }

    @Post('file')
    async saveFile(
        @Body()
        {
            bucketName,
            fileName,
            file,
            isPublic,
        }: {
            bucketName: string;
            fileName: string;
            file: Object;
            isPublic?: boolean;
        }
    ): Promise<{ url: string }> {
        return await this.storageService.saveFile(
            bucketName,
            fileName,
            file,
            isPublic
        );
    }
}
