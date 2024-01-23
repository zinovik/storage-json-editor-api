import { Storage, File } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';

const BUCKET_NAME = 'zinovik-gallery';
const FILES_FILE_NAME = 'files.json';
const ALBUMS_FILE_NAME = 'albums.json';

interface AlbumInterface {
    path: string;
    title: string;
    text?: string | string[];
}

interface FileInterface {
    path: string;
    filename: string;
    type: 'image' | 'video';
    isTitle?: boolean;
    isNoThumbnail?: boolean;
    description?: string;
    text?: string | string[];
    isVertical?: boolean;
}

@Injectable()
export class GalleryService {
    private readonly storage: Storage = new Storage();

    async updateAlbum({
        path,
        newPath,
        title,
        text,
    }: {
        path: string;
        newPath: string;
        title: string;
        text: string | string[];
    }): Promise<void> {
        const bucket = this.storage.bucket(BUCKET_NAME);
        const bucketFile: File = bucket.file(ALBUMS_FILE_NAME);
        const file = await bucketFile.download();

        const albums: AlbumInterface[] = JSON.parse(file.toString());

        const albumsUpdated = albums.map((album) =>
            album.path === path
                ? {
                      ...album,
                      path: newPath,
                      title,
                      text: text || undefined,
                  }
                : album
        );

        const dataBuffer = Buffer.from(JSON.stringify(albumsUpdated));

        await bucketFile.save(dataBuffer, {
            gzip: true,
            public: true,
            resumable: true,
            metadata: {
                contentType: 'application/json',
            },
        });
    }

    async updateFile({
        filename,
        path,
        description,
        text,
    }: {
        filename: string;
        path: string;
        description: string;
        text: string | string[];
    }): Promise<void> {
        const bucket = this.storage.bucket(BUCKET_NAME);
        const bucketFile: File = bucket.file(FILES_FILE_NAME);
        const file = await bucketFile.download();

        const files: FileInterface[] = JSON.parse(file.toString());

        const filesUpdated = files.map((file) =>
            file.filename === filename
                ? {
                      ...file,
                      path,
                      description,
                      text: text || undefined,
                  }
                : file
        );

        const dataBuffer = Buffer.from(JSON.stringify(filesUpdated));

        await bucketFile.save(dataBuffer, {
            gzip: true,
            public: true,
            resumable: true,
            metadata: {
                contentType: 'application/json',
            },
        });
    }
}
