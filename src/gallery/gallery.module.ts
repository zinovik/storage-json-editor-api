import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [GalleryController],
    providers: [GalleryService],
})
export class GalleryModule {}
