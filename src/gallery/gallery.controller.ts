import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryGuard } from './gallery.guard';
import { AlbumInterface, FileInterface } from '../types';

@Controller('gallery')
@UseGuards(new GalleryGuard())
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @Post('album')
    async updateAlbum(
        @Body()
        {
            path,
            newPath,
            title,
            text,
        }: {
            path: string;
            newPath: string;
            title: string;
            text: string | string[];
        }
    ): Promise<AlbumInterface[]> {
        const albums = await this.galleryService.updateAlbum({
            path,
            newPath,
            title,
            text,
        });

        return albums;
    }

    @Post('file')
    async updateFile(
        @Body()
        {
            filename,
            path,
            description,
            text,
        }: {
            filename: string;
            path: string;
            description: string;
            text: string | string[];
        }
    ): Promise<FileInterface[]> {
        const files = await this.galleryService.updateFile({
            filename,
            path,
            description,
            text,
        });

        return files;
    }
}
