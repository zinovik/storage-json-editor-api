import { Storage, File } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { AlbumInterface, FileInterface } from '../types';

const BUCKET_NAME = 'zinovik-gallery';
const FILES_FILE_NAME = 'files.json';
const ALBUMS_FILE_NAME = 'albums.json';

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
    }): Promise<AlbumInterface[]> {
        const bucket = this.storage.bucket(BUCKET_NAME);
        const albumsBucketFile: File = bucket.file(ALBUMS_FILE_NAME);
        const albumsDownloadResponse = await albumsBucketFile.download();

        const albums: AlbumInterface[] = JSON.parse(
            albumsDownloadResponse.toString()
        );

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

        await albumsBucketFile.save(dataBuffer, {
            gzip: true,
            public: true,
            resumable: true,
            metadata: {
                contentType: 'application/json',
            },
        });

        return albumsUpdated;
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
    }): Promise<FileInterface[]> {
        const bucket = this.storage.bucket(BUCKET_NAME);
        const filesBucketFile: File = bucket.file(FILES_FILE_NAME);
        const albumsBucketFile: File = bucket.file(ALBUMS_FILE_NAME);
        const [filesDownloadResponse, albumsDownloadResponse] =
            await Promise.all([
                filesBucketFile.download(),
                albumsBucketFile.download(),
            ]);

        const files: FileInterface[] = JSON.parse(
            filesDownloadResponse.toString()
        );
        const albums: AlbumInterface[] = JSON.parse(
            albumsDownloadResponse.toString()
        );

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

        const albumPaths = albums.map((album) => album.path);

        const filesSorted = [...filesUpdated].sort((f1, f2) =>
            f1.path.split('/')[0] === f2.path.split('/')[0] // the same root path
                ? f1.filename.localeCompare(f2.filename)
                : albumPaths.indexOf(f1.path) - albumPaths.indexOf(f2.path)
        );

        const dataBuffer = Buffer.from(JSON.stringify(filesSorted));

        await filesBucketFile.save(dataBuffer, {
            gzip: true,
            public: true,
            resumable: true,
            metadata: {
                contentType: 'application/json',
            },
        });

        return filesSorted;
    }
}
