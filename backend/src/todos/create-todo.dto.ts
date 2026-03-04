export class CreateTodoDto {
  title!: string;
  description?: string | null;
  dueAt?: string | null;
  status?: 'Pending' | 'Completed';
}
