import { Module } from '@nestjs/common';
import { JsonModule } from './json/json.module';
import { GalleryModule } from './gallery/gallery.module';

@Module({
    imports: [JsonModule, GalleryModule],
})
export class AppModule {}
