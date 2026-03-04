import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './create-todo.dto';
import { Todo } from './todo.entity';
import { UpdateTodoDto } from './update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  findAll(): Promise<Todo[]> {
    return this.todosRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todosRepository.create({
      title: createTodoDto.title.trim(),
      description: createTodoDto.description?.trim() || null,
      dueAt: createTodoDto.dueAt ? new Date(createTodoDto.dueAt) : null,
      completed: createTodoDto.status === 'Completed',
    });
    return this.todosRepository.save(todo);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todosRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} was not found.`);
    }

    if (typeof updateTodoDto.title === 'string') {
      todo.title = updateTodoDto.title.trim();
    }

    if (updateTodoDto.description !== undefined) {
      todo.description = updateTodoDto.description?.trim() || null;
    }

    if (typeof updateTodoDto.completed === 'boolean') {
      todo.completed = updateTodoDto.completed;
    }

    if (updateTodoDto.status !== undefined) {
      todo.completed = updateTodoDto.status === 'Completed';
    }

    if (updateTodoDto.dueAt !== undefined) {
      todo.dueAt = updateTodoDto.dueAt ? new Date(updateTodoDto.dueAt) : null;
    }

    return this.todosRepository.save(todo);
  }

  async remove(id: number): Promise<void> {
    const result = await this.todosRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Todo with id ${id} was not found.`);
    }
  }
}
