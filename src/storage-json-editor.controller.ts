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

    @Get('get-bucket-names')
    async getBucketNames(
        @Req() { allowedBuckets }: { allowedBuckets: string[] }
    ): Promise<{
        bucketNames: string[];
        fileNames: string[];
        file: string;
    }> {
        const bucketNames = (await this.storageService.getBucketNames()).filter(
            (bucketName) => allowedBuckets.includes(bucketName)
        );

        return {
            bucketNames,
            ...(bucketNames.length > 0
                ? await this.getFileNames({ bucketName: bucketNames[0] })
                : { fileNames: [], file: null }),
        };
    }

    @Get('get-file-names')
    async getFileNames(
        @Query() { bucketName }: { bucketName: string }
    ): Promise<{
        fileNames: string[];
        file: string;
    }> {
        const fileNames = (
            await this.storageService.getFileNames(bucketName)
        ).filter((fileName) => fileName.endsWith('.json'));

        return {
            fileNames,
            ...(fileNames.length > 0
                ? await this.getFile({ bucketName, fileName: fileNames[0] })
                : { file: '' }),
        };
    }

    @Get('get-file')
    async getFile(
        @Query()
        { bucketName, fileName }: { bucketName: string; fileName: string }
    ): Promise<{
        file: string;
    }> {
        const file = await this.storageService.getFile(bucketName, fileName);

        return { file };
    }

    @Post('save-file')
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
    ): Promise<string | void> {
        return await this.storageService.saveFile(
            bucketName,
            fileName,
            file,
            isPublic
        );
    }
}
