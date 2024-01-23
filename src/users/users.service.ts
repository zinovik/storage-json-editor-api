import { Injectable } from '@nestjs/common';
import { User } from '../common/user';

@Injectable()
export class UsersService {
    private readonly users = [
        {
            email: 'zinovik@gmail.com',
            allowedBuckets: [
                'hedgehogs',
                'digital-board-games',
                'zinovik-gallery',
            ],
            isGalleryAccess: true,
        },
        {
            email: 'puchochek@gmail.com',
            allowedBuckets: ['hedgehogs'],
        },
    ];

    async findOne(email: string): Promise<User | undefined> {
        return this.users.find((user) => user.email === email);
    }
}
