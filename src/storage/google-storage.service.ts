import { Stream } from 'stream';
import { Storage, File } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.interface';

@Injectable()
export class GoogleStorageService implements StorageService {
    private readonly storage: Storage = new Storage();

    private streamToString(stream: Stream): Promise<string> {
        const chunks: Uint8Array[] = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk: string) =>
                chunks.push(Buffer.from(chunk))
            );
            stream.on('error', (error: Error) => reject(error));
            stream.on('end', () =>
                resolve(Buffer.concat(chunks).toString('utf8'))
            );
        });
    }

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
        const file: File = bucket.file(fileName);

        const data = await this.streamToString(file.createReadStream());

        return JSON.parse(data);
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
