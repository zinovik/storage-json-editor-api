import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JsonService } from './json.service';
import { JsonGuard } from './json.guard';

@Controller('json')
@UseGuards(new JsonGuard())
export class JsonController {
    constructor(private readonly jsonService: JsonService) {}

    @Get()
    async getFile(
        @Query()
        query: { 'bucket-name'?: string; 'file-name'?: string },
        @Req()
        { user: { allowedBuckets } }: { user: { allowedBuckets: string[] } }
    ): Promise<{
        bucketNames: string[];
        fileNames: string[];
        file: string | null;
    }> {
        const { 'bucket-name': bucketName, 'file-name': fileName } = query;

        let bucketNames;

        if (!bucketName) {
            bucketNames = (await this.jsonService.getBucketNames()).filter(
                (bucketName) => allowedBuckets.includes(bucketName)
            );

            if (bucketNames.length === 0)
                return { bucketNames, fileNames: [], file: null };
        }

        const currentBucket = bucketName || bucketNames[0];

        let fileNames;

        if (!fileName) {
            fileNames = (
                await this.jsonService.getFileNames(currentBucket)
            ).filter((fileName) => fileName.endsWith('.json'));

            if (fileNames.length === 0)
                return { bucketNames, fileNames, file: null };
        }

        const currentFilename = fileName || fileNames[0];

        const file = await this.jsonService.getFile(
            currentBucket,
            currentFilename
        );

        return {
            bucketNames,
            fileNames,
            file,
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
        return await this.jsonService.saveFile(bucketName, fileName, file);
    }
}
