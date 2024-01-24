import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryGuard } from './gallery.guard';

@Controller('gallery')
@UseGuards(new GalleryGuard())
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @Post('album')
    async updateAlbum(
        @Body()
        albums: {
            path: string;
            newPath: string;
            title: string;
            text: string | string[];
        }[]
    ): Promise<void> {
        await this.galleryService.updateAlbums(
            albums.map((album) => ({
                path: album.path,
                newPath: album.newPath,
                title: album.title,
                text: album.text,
            }))
        );
    }

    @Post('file')
    async updateFile(
        @Body()
        files: {
            filename: string;
            path: string;
            description: string;
            text: string | string[];
        }[]
    ): Promise<void> {
        await this.galleryService.updateFiles(
            files.map((file) => ({
                filename: file.filename,
                path: file.path,
                description: file.description,
                text: file.text,
            }))
        );
    }
}
