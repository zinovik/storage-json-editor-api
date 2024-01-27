import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { StorageService } from '../storage/storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [GalleryController],
    providers: [StorageService],
})
export class GalleryModule {}
