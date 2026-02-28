import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user';

@UseGuards(AuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todosService.create(user.id, createTodoDto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.todosService.findAll(user.id);
  }

  @Get('id/:id')
  async getTodoById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.todosService.findById(user.id, id);
  }

  @Get('title/:title')
  async getTodoByTitle(
    @CurrentUser() user: AuthUser,
    @Param('title') title: string,
  ) {
    return this.todosService.findByTitle(user.id, title);
  }

  @Put('id/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.updateById(user.id, id, updateTodoDto);
  }

  @Put('title/:title')
  async updateByTitle(
    @CurrentUser() user: AuthUser,
    @Param('title') title: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.updateByTitle(user.id, title, updateTodoDto);
  }

  @Delete('id/:id')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.todosService.deleteById(user.id, id);
  }

  @Delete('title/:title')
  async deleteByTitle(
    @CurrentUser() user: AuthUser,
    @Param('title') title: string,
  ) {
    return this.todosService.deleteByTitle(user.id, title);
  }
}
