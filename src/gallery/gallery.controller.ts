import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryGuard } from './gallery.guard';

@Controller('gallery')
@UseGuards(new GalleryGuard())
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @Post()
    async update(
        @Body()
        body: {
            update: {
                albums?: {
                    path: string;
                    newPath: string;
                    title: string;
                    text: string | string[];
                }[];
                files?: {
                    filename: string;
                    path: string;
                    description: string;
                    text: string | string[];
                }[];
            };
        }
    ): Promise<void> {
        console.log(JSON.stringify(body));

        const shouldUpdateAlbums =
            body.update.albums && body.update.albums.length > 0;
        const shouldUpdateFiles =
            body.update.files && body.update.files.length > 0;

        const [albumsOld, filesOld] = await Promise.all([
            this.galleryService.getAlbums(),
            ...(shouldUpdateFiles ? [this.galleryService.getFiles()] : []),
        ]);

        let mutableAlbumsUpdated = albumsOld;

        if (shouldUpdateAlbums) {
            mutableAlbumsUpdated = albumsOld.map((albumOld) => {
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

            await this.galleryService.saveAlbums(mutableAlbumsUpdated);
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

            await this.galleryService.saveFiles(filesSorted);
        }
    }
}
