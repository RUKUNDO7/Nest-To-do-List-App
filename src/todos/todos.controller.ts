import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodosController {
    constructor(private readonly todosService: TodosService) {}

        @Post()
        async create(@Body() createTodoDto: CreateTodoDto) {
            return this.todosService.create(createTodoDto.title);
        }

        @Get()
        async findAll() {
            return this.todosService.findAll();
        }

        @Get('id/:id') 
        async getTodoById(@Param('id', ParseIntPipe) id: number) {
            return this.todosService.findById(id);
        }

        @Get('title/:title')
        async getTodoByTitle(@Param('title') title: string) {
            return this.todosService.findByTitle(title);
        }

        @Put('id/:id')
        async update(
            @Param('id', ParseIntPipe) id: number, 
            @Body() updateTodoDto: UpdateTodoDto) {
            return this.todosService.updateById(id, updateTodoDto);
        }

        @Put('title/:title')
        async updateByTitle(
            @Param('title') title: string,
            @Body() updateTodoDto: UpdateTodoDto
        ) {
            return this.todosService.updateByTitle(title, updateTodoDto);
        }

        @Delete('id/:id')
        async remove(@Param('id') id: number) {
            return this.todosService.deleteById(id);
        }

        @Delete('title/:title')
        async deleteByTitle(@Param('title') title: string) {
            return this.todosService.deleteByTitle(title);
        }
    }
