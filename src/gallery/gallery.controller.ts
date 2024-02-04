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
    isTitle?: true;
    isNoThumbnail?: true;
    description?: string;
    text?: string | string[];
    isVertical?: true;
}

interface AddedAlbum {
    pathPart: string;
    title: string;
    text: string | string[];
    relatedPath: string;
    relation: 'after' | 'before' | 'in';
}

interface AddedFile {
    path: string;
    filename: string;
    description: string;
    text: string | string[];
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

interface RemovedAlbum {
    path: string;
}

interface RemovedFile {
    filename: string;
}

@Controller('gallery')
@UseGuards(new GalleryGuard())
export class GalleryController {
    constructor(private readonly storageService: StorageService) {}

    @Post()
    async update(
        @Body()
        body: {
            add?: {
                albums?: AddedAlbum[];
                files?: AddedFile[];
            };
            update?: {
                albums?: UpdatedAlbum[];
                files?: UpdatedFile[];
            };
            remove?: {
                albums?: RemovedAlbum[];
                files?: RemovedFile[];
            };
        }
    ): Promise<void> {
        console.log(JSON.stringify(body));

        const shouldAddAlbums = body.add?.albums && body.add.albums.length > 0;
        const shouldAddFiles = body.add?.files && body.add.files.length > 0;
        const shouldUpdateAlbums =
            body.update?.albums && body.update.albums.length > 0;
        const shouldUpdateFiles =
            body.update?.files && body.update.files.length > 0;
        const shouldRemoveAlbums =
            body.remove?.albums && body.remove.albums.length > 0;
        const shouldRemoveFiles =
            body.remove?.files && body.remove.files.length > 0;

        const [albumsOld, filesOld] = (await Promise.all([
            ...(shouldAddAlbums ||
            shouldUpdateAlbums ||
            shouldRemoveAlbums ||
            shouldAddFiles ||
            shouldUpdateFiles ||
            shouldRemoveFiles
                ? [this.storageService.getFile(BUCKET_NAME, ALBUMS_FILE_NAME)]
                : []),
            ...(shouldAddFiles || shouldUpdateFiles || shouldRemoveFiles
                ? [this.storageService.getFile(BUCKET_NAME, FILES_FILE_NAME)]
                : []),
        ])) as [AlbumInterface[], FileInterface[]];

        let mutableAlbumsUpdated = albumsOld;

        if (shouldAddAlbums || shouldUpdateAlbums || shouldRemoveAlbums) {
            const albumsWithAdded = shouldAddAlbums
                ? this.addAlbums(albumsOld, body.add.albums)
                : albumsOld;
            const albumsUpdated = shouldUpdateAlbums
                ? this.updateAlbums(albumsWithAdded, body.update.albums)
                : albumsWithAdded;
            const albumsSorted = this.sortAlbums(albumsUpdated);
            mutableAlbumsUpdated = shouldRemoveAlbums
                ? this.removeAlbums(albumsSorted, body.remove.albums)
                : albumsSorted;

            await this.storageService.saveFile(
                BUCKET_NAME,
                ALBUMS_FILE_NAME,
                mutableAlbumsUpdated
            );
        }

        if (shouldAddFiles || shouldUpdateFiles || shouldRemoveFiles) {
            const filesWithAdded = shouldAddFiles
                ? this.addFiles(filesOld, body.add.files)
                : filesOld;
            const filesUpdated = shouldUpdateFiles
                ? this.updateFiles(filesWithAdded, body.update.files)
                : filesWithAdded;
            const filesSorted = this.sortFiles(
                filesUpdated,
                mutableAlbumsUpdated
            );
            const filesWithoutRemoved = shouldRemoveFiles
                ? this.removeFiles(filesSorted, body.remove.files)
                : filesSorted;

            await this.storageService.saveFile(
                BUCKET_NAME,
                FILES_FILE_NAME,
                filesWithoutRemoved
            );
        }
    }

    private addAlbums(
        albums: AlbumInterface[],
        addedAlbums: AddedAlbum[]
    ): AlbumInterface[] {
        const albumsWithAdded = [...albums];

        addedAlbums.forEach((addedAlbum) => {
            const relatedPathIndex = albumsWithAdded.findIndex(
                (album) => album.path === addedAlbum.relatedPath
            );

            if (relatedPathIndex === -1) return;

            albumsWithAdded.splice(
                relatedPathIndex + (addedAlbum.relation === 'before' ? 0 : 1),
                0,
                {
                    title: addedAlbum.title,
                    text: addedAlbum.text || undefined,
                    path:
                        addedAlbum.relation === 'in'
                            ? `${addedAlbum.relatedPath}/${addedAlbum.pathPart}`
                            : `${addedAlbum.relatedPath.slice(
                                  0,
                                  addedAlbum.relatedPath.lastIndexOf('/')
                              )}/${addedAlbum.pathPart}`,
                }
            );
        });

        return albumsWithAdded;
    }

    private updateAlbums(
        albums: AlbumInterface[],
        updateAlbums: UpdatedAlbum[]
    ): AlbumInterface[] {
        return albums.map((albums) => {
            const updateAlbum = updateAlbums.find(
                (updateAlbum) => updateAlbum.path === albums.path
            );

            return updateAlbum
                ? {
                      ...albums,
                      path: updateAlbum.newPath,
                      title: updateAlbum.title,
                      text: updateAlbum.text || undefined,
                  }
                : albums;
        });
    }

    private sortAlbums(albums: AlbumInterface[]): AlbumInterface[] {
        const sortedAlbums = albums
            .filter((album) => album.isSorted)
            .map((album) => album.path);

        return [...albums].sort((a1, a2) => {
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
    }

    private removeAlbums(
        albums: AlbumInterface[],
        removedAlbums: RemovedAlbum[]
    ): AlbumInterface[] {
        return albums.filter(
            (album) =>
                !removedAlbums.some(
                    (removedAlbum) => removedAlbum.path === album.path
                )
        );
    }

    private addFiles(
        files: FileInterface[],
        addedFiles: AddedFile[]
    ): FileInterface[] {
        return [
            ...files,
            ...addedFiles.map((addedFile) => ({
                ...addedFile,
                text: addedFile.text || undefined,
            })),
        ];
    }

    private updateFiles(
        files: FileInterface[],
        updatedFiles: UpdatedFile[]
    ): FileInterface[] {
        return files.map((files) => {
            const updatedFile = updatedFiles.find(
                (updatedFile) => updatedFile.filename === files.filename
            );

            return updatedFile
                ? {
                      ...files,
                      path: updatedFile.path,
                      description: updatedFile.description,
                      text: updatedFile.text || undefined,
                  }
                : files;
        });
    }

    private sortFiles(
        files: FileInterface[],
        albums: AlbumInterface[]
    ): FileInterface[] {
        const albumPaths = albums.map((album) => album.path);

        return [...files].sort((f1, f2) =>
            f1.path.split('/')[0] === f2.path.split('/')[0] // the same root path
                ? f1.filename.localeCompare(f2.filename)
                : albumPaths.indexOf(f1.path) - albumPaths.indexOf(f2.path)
        );
    }

    private removeFiles(
        files: FileInterface[],
        removedFiles: RemovedFile[]
    ): FileInterface[] {
        return files.filter(
            (file) =>
                !removedFiles.some(
                    (removedFile) => removedFile.filename === file.filename
                )
        );
    }
}
