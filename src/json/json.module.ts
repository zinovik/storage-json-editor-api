import { Module } from '@nestjs/common';
import { JsonController } from './json.controller';
import { JsonService } from './json.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [JsonController],
    providers: [JsonService],
})
export class JsonModule {}
