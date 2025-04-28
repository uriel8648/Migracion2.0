import { Component, OnInit } from '@angular/core';
import { TodoService } from './services/todo.service';
import { Todo } from './models/todo.model';
import { finalize } from 'rxjs/operators';

/**
 * AppComponent - Main component that replaces the AngularJS TodoController
 * 
 * Migration notes:
 * - Converted $scope properties to component class properties
 * - Replaced $http calls with TodoService that uses HttpClient
 * - Implemented OnInit lifecycle hook instead of controller initialization
 * - Converted ng-model to [(ngModel)] for two-way binding
 * - Moved sorting and pagination logic to component methods
 * - Added proper TypeScript types to all variables
 * - Added loading state for better UX
 * - Improved error handling with RxJS operators
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Properties that were on $scope in AngularJS
  todos: Todo[] = [];
  newTodo: Todo = this.resetTodoForm();
  editMode = false;
  editIndex = -1;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  showNext = false;
  showPrev = false;
  
  // Sorting properties
  sortField = 'ID';
  sortAscending = true;

  // UI state properties
  loading = false;
  errorMessage = '';


  /**
   * Constructor with dependency injection
   * Replaces AngularJS $http with TodoService
   */
  constructor(private todoService: TodoService) {}

  /**
   * Lifecycle hook that replaces the controller initialization
   */
  ngOnInit(): void {
    this.loadTodos();
  }

  /**
   * Loads todos from the backend with current sorting and pagination
   */
  loadTodos(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const apiSortField = this.sortField.toLowerCase();
    
    this.todoService.getTodos(apiSortField, this.sortAscending ? 'asc' : 'desc', this.currentPage + 1)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data: Todo[]) => {
          this.todos = data;
          // Update pagination flags
          this.showNext = this.todos.length === this.pageSize;
          this.showPrev = this.currentPage > 0;
        },
        error: (error: any) => {
          console.error('Error loading todos:', error);
          this.errorMessage = 'Failed to load todos. Please try again later.';
        }
      });
    
  }

  /**
   * Toggles the sort field and direction
   */
  toggleSortField(field: string): void {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.loadTodos();
  }

  /**
   * Pagination: go to next page
   */
  toggleNextPage(): void {
    this.currentPage++;
    this.loadTodos();
  }

  /**
   * Pagination: go to previous page
   */
  togglePrevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTodos();
    }
  }

  /**
   * Saves a new todo or updates an existing one
   */
  saveTodo(): void {
    if (!this.newTodo.title.trim()) {
      this.errorMessage = 'Title is required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.editMode) {
      this.todoService.updateTodo(this.newTodo)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (updatedTodo: Todo) => {
            this.todos[this.editIndex] = updatedTodo;
            this.resetForm();
          },
        error: (error: any) => {
          console.error('Error updating todo:', error);
          this.errorMessage = 'Failed to update todo. Please try again.';
        }
        });
    } else {
      this.todoService.createTodo(this.newTodo)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (createdTodo: Todo) => {
            // Only add to the current view if we're on the first page or if appropriate for the current sort
            if (this.currentPage === 0) {
              this.todos.unshift(createdTodo);
            }
            this.resetForm();
            // Reload to ensure proper sorting and pagination
            this.loadTodos();
          },
          error: (error: any) => {
            console.error('Error creating todo:', error);
            this.errorMessage = 'Failed to create todo. Please try again.';
          }
        });
    }
  }

  /**
   * Prepares the form for editing an existing todo
   */
  editTodo(todo: Todo, index: number): void {
    this.editMode = true;
    this.editIndex = index;
    // Create a copy to avoid modifying the original until save
    this.newTodo = { ...todo };
  }

  /**
   * Cancels the edit operation
   */
  cancelEdit(): void {
    this.resetForm();
  }

  /**
   * Toggles the completion status of a todo
   */
  toggleStatus(todo: Todo): void {
    this.loading = true;
    this.errorMessage = '';
    
    const updatedTodo: Todo = { 
      ...todo, 
      completed: !todo.completed,
      completedDate: !todo.completed ? new Date() : null
    };
    
    this.todoService.updateTodo(updatedTodo)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (result: Todo) => {
          // Find and update the todo in our local array
          const index = this.todos.findIndex(t => t.id === result.id);
          if (index !== -1) {
            this.todos[index] = result;
          }
        },
        error: (error: any) => {
          console.error('Error toggling todo status:', error);
          this.errorMessage = 'Failed to update todo status. Please try again.';
        }
      });
  }

  /**
   * Deletes a todo
   */
  deleteTodo(id: number | undefined, index: number): void {
    if (id === undefined) {
      console.warn('deleteTodo called with undefined id');
      return;
    }
    if (confirm('Are you sure you want to delete this todo?')) {
      this.loading = true;
      this.errorMessage = '';
      
      this.todoService.deleteTodo(id)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.todos.splice(index, 1);
          },
        error: (error: any) => {
          console.error('Error deleting todo:', error);
          this.errorMessage = 'Failed to delete todo. Please try again.';
        }
        });
    }
  }

  /**
   * Resets the form to default values
   */
  private resetForm(): void {
    this.newTodo = this.resetTodoForm();
    this.editMode = false;
    this.editIndex = -1;
    this.errorMessage = '';
  }

  /**
   * Creates an empty todo object
   */
  private resetTodoForm(): Todo {
    return {
      id: undefined,
      title: '',
      description: '',
      completed: false,
      createdDate: null,
      completedDate: null
    };
  }
 
  get nextPage(): number {
    return this.currentPage;
  }

  
}