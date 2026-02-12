import { Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Todo } from './todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findById(id: number) {
    const todo = await this.repo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException(`Todo with id ${id} not found`);
    return todo;
  }

  async findByTitle(title: string) {
    const todo = await this.repo.findOne({ where: { title: ILike(title) } });
    if (!todo) throw new NotFoundException(`Todo with title ${title} not found`);
    return todo;
  }

  async create(title: string) {
    const todo = this.repo.create({ title });
    return this.repo.save(todo);
  }

  async updateById(id: number, updateDto: UpdateTodoDto) {
    const todo = await this.findById(id);
    Object.assign(todo, updateDto);
    return this.repo.save(todo);
  }

  async updateByTitle(title: string, updateDto: UpdateTodoDto) {
    const todo = await this.findByTitle(title);
    Object.assign(todo, updateDto);
    return this.repo.save(todo);
  }

  async deleteById(id: number) {
    const todo = await this.findById(id);
    return this.repo.remove(todo);
  }

  async deleteByTitle(title: string) {
    const todo = await this.findByTitle(title);
    return this.repo.remove(todo);
  }
}
