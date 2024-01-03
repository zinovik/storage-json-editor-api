import { Module } from '@nestjs/common';
import { StorageJsonEditorController } from './storage-json-editor.controller';
import { GoogleStorageService } from './storage/google-storage.service';

@Module({
    imports: [],
    controllers: [StorageJsonEditorController],
    providers: [GoogleStorageService],
})
export class AppModule {}
