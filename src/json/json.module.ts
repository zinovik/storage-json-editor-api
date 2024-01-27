import { Module } from '@nestjs/common';
import { JsonController } from './json.controller';
import { StorageService } from '../storage/storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [JsonController],
    providers: [StorageService],
})
export class JsonModule {}
