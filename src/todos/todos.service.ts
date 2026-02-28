import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Todo } from './todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  findAll(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });
  }

  async findById(userId: string, id: number) {
    const todo = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!todo) throw new NotFoundException(`Todo with id ${id} not found`);
    return todo;
  }

  async findByTitle(userId: string, title: string) {
    const todo = await this.repo.findOne({
      where: { title: ILike(title), user: { id: userId } },
    });
    if (!todo) throw new NotFoundException(`Todo with title ${title} not found`);
    return todo;
  }

  async create(userId: string, dto: CreateTodoDto) {
    const todo = this.repo.create({
      title: dto.title,
      status: dto.status ?? false,
      user: { id: userId } as User,
    });
    return this.repo.save(todo);
  }

  async updateById(userId: string, id: number, updateDto: UpdateTodoDto) {
    const todo = await this.findById(userId, id);
    Object.assign(todo, updateDto);
    return this.repo.save(todo);
  }

  async updateByTitle(userId: string, title: string, updateDto: UpdateTodoDto) {
    const todo = await this.findByTitle(userId, title);
    Object.assign(todo, updateDto);
    return this.repo.save(todo);
  }

  async deleteById(userId: string, id: number) {
    const todo = await this.findById(userId, id);
    return this.repo.remove(todo);
  }

  async deleteByTitle(userId: string, title: string) {
    const todo = await this.findByTitle(userId, title);
    return this.repo.remove(todo);
  }
}
