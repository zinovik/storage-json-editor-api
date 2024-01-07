import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [StorageController],
    providers: [StorageService],
})
export class StorageModule {}
