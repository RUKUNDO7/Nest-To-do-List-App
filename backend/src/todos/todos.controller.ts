import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTodoDto } from './create-todo.dto';
import { UpdateTodoDto } from './update-todo.dto';
import { TodosService } from './todos.service';

function isValidIsoDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function isNowOrFuture(value: string): boolean {
  return new Date(value).getTime() >= Date.now();
}

function isValidStatus(value: string): boolean {
  return value === 'Pending' || value === 'Completed';
}

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll() {
    return this.todosService.findAll();
  }

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    if (!createTodoDto?.title || createTodoDto.title.trim().length === 0) {
      throw new BadRequestException('Title is required.');
    }

    if (
      typeof createTodoDto.description === 'string' &&
      createTodoDto.description.trim().length === 0
    ) {
      throw new BadRequestException('Description cannot be empty.');
    }

    if (
      createTodoDto.dueAt !== undefined &&
      createTodoDto.dueAt !== null &&
      !isValidIsoDate(createTodoDto.dueAt)
    ) {
      throw new BadRequestException('dueAt must be a valid ISO date.');
    }
    if (
      createTodoDto.dueAt !== undefined &&
      createTodoDto.dueAt !== null &&
      isValidIsoDate(createTodoDto.dueAt) &&
      !isNowOrFuture(createTodoDto.dueAt)
    ) {
      throw new BadRequestException('dueAt must be now or in the future.');
    }
    if (
      createTodoDto.status !== undefined &&
      !isValidStatus(createTodoDto.status)
    ) {
      throw new BadRequestException(
        'status must be either Pending or Completed.',
      );
    }

    return this.todosService.create(createTodoDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    if (
      typeof updateTodoDto.title === 'string' &&
      updateTodoDto.title.trim().length === 0
    ) {
      throw new BadRequestException('Title cannot be empty.');
    }
    if (
      typeof updateTodoDto.description === 'string' &&
      updateTodoDto.description.trim().length === 0
    ) {
      throw new BadRequestException('Description cannot be empty.');
    }

    if (
      updateTodoDto.title === undefined &&
      updateTodoDto.description === undefined &&
      updateTodoDto.completed === undefined &&
      updateTodoDto.dueAt === undefined &&
      updateTodoDto.status === undefined
    ) {
      throw new BadRequestException(
        'At least one field (title, description, completed, dueAt, or status) must be provided.',
      );
    }

    if (
      updateTodoDto.dueAt !== undefined &&
      updateTodoDto.dueAt !== null &&
      !isValidIsoDate(updateTodoDto.dueAt)
    ) {
      throw new BadRequestException('dueAt must be a valid ISO date.');
    }
    if (
      updateTodoDto.dueAt !== undefined &&
      updateTodoDto.dueAt !== null &&
      isValidIsoDate(updateTodoDto.dueAt) &&
      !isNowOrFuture(updateTodoDto.dueAt)
    ) {
      throw new BadRequestException('dueAt must be now or in the future.');
    }
    if (
      updateTodoDto.status !== undefined &&
      !isValidStatus(updateTodoDto.status)
    ) {
      throw new BadRequestException(
        'status must be either Pending or Completed.',
      );
    }

    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.todosService.remove(id);
    return { deleted: true };
  }
}
