/**
 * Todo model interface
 * 
 * This interface defines the shape of a Todo item in the application.
 * Using interfaces in TypeScript provides compile-time type checking
 * and better code documentation.
 */
export interface Todo {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  createdDate?: Date | null;
  completedDate?: Date | null;
}

/**
 * Todo model class
 * 
 * This model represents a Todo item in the application.
 * It was migrated from the AngularJS todo object structure in the original
 * TodoController, where todos were managed as plain JavaScript objects.
 * 
 * In Angular, we use interfaces to define the shape of our data models,
 * providing type safety throughout the application.
 * 
 * Properties:
 * - id: unique identifier (optional for new todos)
 * - title: required title of the todo
 * - description: optional description of the todo
 * - completed: boolean flag indicating completion status
 * - createdDate: when the todo was created (set by server)
 * - completedDate: when the todo was marked as completed (null if not completed)
 */
export class TodoModel implements Todo {
  id?: number;
  title: string = '';
  description: string = '';
  completed: boolean = false;
  createdDate?: Date | null;
  completedDate?: Date | null = null;

  constructor(todo?: Partial<Todo>) {
    if (todo) {
      this.id = todo.id;
      this.title = todo.title || '';
      this.description = todo.description || '';
      this.completed = todo.completed || false;
      
      // Handle date conversion if the dates come as strings from the API
      if (todo.createdDate !== undefined && todo.createdDate !== null) {
        this.createdDate = todo.createdDate instanceof Date 
          ? todo.createdDate 
          : new Date(todo.createdDate);
      } else {
        this.createdDate = null;
      }
      
      if (todo.completedDate) {
        this.completedDate = todo.completedDate instanceof Date 
          ? todo.completedDate 
          : new Date(todo.completedDate);
      } else {
        this.completedDate = null;
      }
    }
  }

  /**
   * Creates a new empty Todo object
   * Equivalent to the resetForm() functionality in the original AngularJS controller
   */
  static createEmpty(): TodoModel {
    return new TodoModel({
      title: '',
      description: '',
      completed: false
    });
  }

  /**
   * Creates a copy of an existing Todo
   * Equivalent to angular.copy() in the original AngularJS controller
   */
  static createCopy(todo: Todo): TodoModel {
    return new TodoModel({...todo});
  }
}