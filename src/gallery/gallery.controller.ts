import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GalleryGuard } from './gallery.guard';
import { StorageService } from '../storage/storage.service';

const BUCKET_NAME = 'zinovik-gallery';
const FILES_FILE_NAME = 'files.json';
const ALBUMS_FILE_NAME = 'albums.json';

interface AlbumInterface {
    path: string;
    title: string;
    text?: string | string[];
    isSorted?: true;
}

interface FileInterface {
    path: string;
    filename: string;
    type: 'image' | 'video';
    url: string;
    datetime: string;
    isTitle?: true;
    isNoThumbnail?: true;
    description?: string;
    text?: string | string[];
    isVertical?: true;
}

interface UpdatedAlbum {
    path: string;
    newPath: string;
    title: string;
    text: string | string[];
}

interface UpdatedFile {
    filename: string;
    path: string;
    description: string;
    text: string | string[];
}

@Controller('gallery')
@UseGuards(new GalleryGuard())
export class GalleryController {
    constructor(private readonly storageService: StorageService) {}

    @Post()
    async update(
        @Body()
        body: {
            add: {};
            update?: {
                albums?: UpdatedAlbum[];
                files?: UpdatedFile[];
            };
        }
    ): Promise<void> {
        console.log(JSON.stringify(body));

        const shouldUpdateAlbums =
            body.update?.albums && body.update.albums.length > 0;
        const shouldUpdateFiles =
            body.update?.files && body.update.files.length > 0;

        const [albumsOld, filesOld] = (await Promise.all([
            this.storageService.getFile(BUCKET_NAME, ALBUMS_FILE_NAME),
            ...(shouldUpdateFiles
                ? [this.storageService.getFile(BUCKET_NAME, FILES_FILE_NAME)]
                : []),
        ])) as [AlbumInterface[], FileInterface[]];

        let mutableAlbumsUpdated = albumsOld;

        if (shouldUpdateAlbums) {
            const albumsUpdated = albumsOld.map((albumOld) => {
                const album = body.update.albums.find(
                    (album) => album.path === albumOld.path
                );

                return album
                    ? {
                          ...albumOld,
                          path: album.newPath,
                          title: album.title,
                          text: album.text || undefined,
                      }
                    : albumOld;
            });

            const sortedAlbums = albumsUpdated
                .filter((album) => album.isSorted)
                .map((album) => album.path);

            mutableAlbumsUpdated = [...albumsUpdated].sort((a1, a2) => {
                if (a1.path.split('/')[0] !== a2.path.split('/')[0]) {
                    return 0;
                }

                // the same root path

                // is sorted album
                if (sortedAlbums.includes(a1.path.split('/')[0]))
                    return a1.path.localeCompare(a2.path);

                if (a2.path.includes(a1.path)) return -1;
                if (a1.path.includes(a2.path)) return 1;

                return 0;
            });

            await this.storageService.saveFile(
                BUCKET_NAME,
                ALBUMS_FILE_NAME,
                mutableAlbumsUpdated
            );
        }

        if (shouldUpdateFiles) {
            const filesUpdated = filesOld.map((fileOld) => {
                const file = body?.update?.files.find(
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

            const albumPaths = mutableAlbumsUpdated.map((album) => album.path);

            const filesSorted = [...filesUpdated].sort((f1, f2) =>
                f1.path.split('/')[0] === f2.path.split('/')[0] // the same root path
                    ? f1.filename.localeCompare(f2.filename)
                    : albumPaths.indexOf(f1.path) - albumPaths.indexOf(f2.path)
            );

            await this.storageService.saveFile(
                BUCKET_NAME,
                FILES_FILE_NAME,
                filesSorted
            );
        }
    }
}
