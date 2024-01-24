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

    async updateAlbums(
        albums: {
            path: string;
            newPath: string;
            title: string;
            text: string | string[];
        }[]
    ): Promise<void> {
        const bucket = this.storage.bucket(BUCKET_NAME);
        const albumsBucketFile: File = bucket.file(ALBUMS_FILE_NAME);
        const albumsDownloadResponse = await albumsBucketFile.download();

        const albumsOld: AlbumInterface[] = JSON.parse(
            albumsDownloadResponse.toString()
        );

        const albumsUpdated = albumsOld.map((albumOld) => {
            const album = albums.find((album) => album.path === albumOld.path);

            return album
                ? {
                      ...albumOld,
                      path: album.newPath,
                      title: album.title,
                      text: album.text || undefined,
                  }
                : albumOld;
        });

        const dataBuffer = Buffer.from(JSON.stringify(albumsUpdated));

        await albumsBucketFile.save(dataBuffer, {
            gzip: true,
            public: true,
            resumable: true,
            metadata: {
                contentType: 'application/json',
            },
        });
    }

    async updateFiles(
        files: {
            filename: string;
            path: string;
            description: string;
            text: string | string[];
        }[]
    ): Promise<void> {
        const bucket = this.storage.bucket(BUCKET_NAME);
        const filesBucketFile: File = bucket.file(FILES_FILE_NAME);
        const albumsBucketFile: File = bucket.file(ALBUMS_FILE_NAME);
        const [filesDownloadResponse, albumsDownloadResponse] =
            await Promise.all([
                filesBucketFile.download(),
                albumsBucketFile.download(),
            ]);

        const filesOld: FileInterface[] = JSON.parse(
            filesDownloadResponse.toString()
        );
        const albums: AlbumInterface[] = JSON.parse(
            albumsDownloadResponse.toString()
        );

        const filesUpdated = filesOld.map((fileOld) => {
            const file = files.find(
                (file) => file.filename === fileOld.filename
            );

            return file
                ? {
                      ...fileOld,
                      path: file.path,
                      description: file.description,
                      text: file.text || undefined,
                  }
                : fileOld;
        });

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
    }
}
