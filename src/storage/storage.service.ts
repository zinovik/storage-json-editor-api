import { Storage, File } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
    private readonly storage: Storage = new Storage();

    async getBucketNames(): Promise<string[]> {
        const [buckets] = await this.storage.getBuckets();

        return buckets.map((bucket) => bucket.name);
    }

    async getFileNames(bucketName: string): Promise<string[]> {
        const [files] = await this.storage.bucket(bucketName).getFiles();

        return files.map((file) => file.name);
    }

    async getFile(bucketName: string, fileName: string): Promise<string> {
        const bucket = this.storage.bucket(bucketName);
        const file = await bucket.file(fileName).download();

        return JSON.parse(file.toString());
    }

    async saveFile(
        bucketName: string,
        fileName: string,
        file: Object,
        isPublic?: boolean
    ): Promise<{ url: string }> {
        const bucket = this.storage.bucket(bucketName);
        const bucketFile: File = bucket.file(fileName);
        const dataBuffer = Buffer.from(JSON.stringify(file));

        await bucketFile.save(dataBuffer, {
            gzip: true,
            public: isPublic || false,
            resumable: true,
            metadata: {
                contentType: 'application/json',
            },
        });

        return {
            url: isPublic
                ? `https://storage.googleapis.com/${bucketName}/${fileName}`
                : '',
        };
    }
}
