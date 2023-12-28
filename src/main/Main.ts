import { GoogleAuthService } from '../authorization/GoogleAuth.service';
import { StorageService } from '../storage/Storage.interface';

const ALLOWED_BUCKETS: Record<string, string[]> = {
    'zinovik@gmail.com': ['hedgehogs', 'digital-board-games', 'gallery'],
    'puchochek@gmail.com': ['hedgehogs'],
};

export class Main {
    constructor(
        private readonly authService: GoogleAuthService,
        private readonly storageService: StorageService
    ) {
        this.authService = authService;
        this.storageService = storageService;
    }

    private async getBucketNames(allowedBuckets: string[]): Promise<{
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
                ? await this.getFileNames(bucketNames[0])
                : { fileNames: [], file: null }),
        };
    }

    private async getFileNames(bucketName: string): Promise<{
        fileNames: string[];
        file: string;
    }> {
        const fileNames = await this.storageService.getFileNames(bucketName);

        return {
            fileNames,
            ...(fileNames.length > 0
                ? await this.getFile(bucketName, fileNames[0])
                : { file: '' }),
        };
    }

    private async getFile(
        bucketName: string,
        fileName: string
    ): Promise<{
        file: string;
    }> {
        const file = await this.storageService.getFile(bucketName, fileName);

        return { file };
    }

    async process(
        token: string,
        action: string,
        payload: any
    ): Promise<{
        bucketNames?: string[];
        fileNames?: string[];
        file: string;
    } | void> {
        const email = await this.authService.verify(token);

        const allowedBuckets = ALLOWED_BUCKETS[email] || [];

        if (allowedBuckets.length === 0) {
            return { bucketNames: [], fileNames: [], file: '' };
        }

        switch (action) {
            case 'GET_BUCKET_NAMES':
                return await this.getBucketNames(allowedBuckets);

            case 'GET_FILE_NAMES':
                if (!allowedBuckets.includes(payload.bucketName))
                    throw new Error();

                return await this.getFileNames(payload.bucketName);

            case 'GET_FILE':
                if (!allowedBuckets.includes(payload.bucketName))
                    throw new Error();

                return await this.getFile(payload.bucketName, payload.fileName);

            case 'SAVE_FILE':
                if (!allowedBuckets.includes(payload.bucketName))
                    throw new Error();

                return await this.storageService.saveFile(
                    payload.bucketName,
                    payload.fileName,
                    payload.file,
                    payload.isPublic
                );

            default:
                return;
        }
    }
}
