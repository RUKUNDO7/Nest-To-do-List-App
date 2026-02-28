import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  create(data: CreateUserInput) {
    const user = this.repo.create({
      ...data,
      role: data.role ?? 'user',
    });
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  list() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
