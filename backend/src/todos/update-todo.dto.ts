export class UpdateTodoDto {
  title?: string;
  description?: string | null;
  completed?: boolean;
  dueAt?: string | null;
  status?: 'Pending' | 'Completed';
}
