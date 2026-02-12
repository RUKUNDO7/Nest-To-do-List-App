import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodosService } from './todos.service';
import { Todo } from './todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodosService', () => {
  let service: TodosService;
  let repo: Repository<Todo>;

  const mockTodoRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockTodoRepository,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repo = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const todos = [{ id: 1, title: 'Test', status: false }];
      mockTodoRepository.find.mockResolvedValue(todos);

      expect(await service.findAll()).toEqual(todos);
      expect(mockTodoRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a todo by id', async () => {
      const todo = { id: 1, title: 'Test', status: false };
      mockTodoRepository.findOneBy.mockResolvedValue(todo);

      expect(await service.findById(1)).toEqual(todo);
      expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const todo = { id: 1, title: 'Test', status: false };
      mockTodoRepository.save.mockResolvedValue(todo);

      expect(await service.create('Test')).toEqual(todo);
      expect(mockTodoRepository.save).toHaveBeenCalledWith({ title: 'Test', status: false });
    });
  });

  describe('updateById', () => {
    it('should update a todo', async () => {
      const updateDto: UpdateTodoDto = { title: 'Updated', status: true };
      const todo = { id: 1, title: 'Test', status: false };
      mockTodoRepository.findOneBy.mockResolvedValue(todo);
      mockTodoRepository.save.mockResolvedValue({ ...todo, ...updateDto });

      expect(await service.updateById(1, updateDto)).toEqual({ ...todo, ...updateDto });
      expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockTodoRepository.save).toHaveBeenCalledWith({ ...todo, ...updateDto });
    });
  });

  describe('deleteById', () => {
    it('should delete a todo', async () => {
      mockTodoRepository.delete.mockResolvedValue({ affected: 1 });

      expect(await service.deleteById(1)).toEqual({ affected: 1 });
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});