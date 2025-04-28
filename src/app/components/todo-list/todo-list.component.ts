import { Component, OnInit } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  // Constant for page size
  readonly PAGE_SIZE = 10;

  // Collection of todos
  todos: Todo[] = [];
  
  // Model for new/edited todo
  newTodo: Todo = this.getEmptyTodo();
  
  // Editing state
  editMode = false;
  editIndex = -1;
  
  // Pagination and sorting
  sortOrder: 'asc' | 'desc' = 'asc';
  sortField: string = 'ID';
  currentPage = 1;
  showNext = false;
  showPrev = false;
  
  // Loading state
  loading = false;

  constructor(private todoService: TodoService) {}

  get nextPage(): number {
    return this.currentPage;
  }

  ngOnInit(): void {
    // Load todos when component initializes
    this.loadTodos();
  }

  /**
   * Loads todos with current pagination and sorting parameters
   */
  loadTodos(): void {
    this.loading = true;
    this.todoService.getTodos(this.sortField, this.sortOrder, this.currentPage)
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error loading todos:', error);
          alert('Failed to load todos. Check console for details.');
          return of([]);
        })
      )
      .subscribe((data: Todo[]) => {
        this.todos = data.slice(0, this.PAGE_SIZE);
        
        // Determine if pagination controls should be shown
        this.showNext = this.todos.length >= this.PAGE_SIZE;
        this.showPrev = this.currentPage > 1;
      });
  }

  /**
   * Creates a new todo
   */
  createTodo(): void {
    if (!this.newTodo.title) {
      alert('Title is required!');
      return;
    }
    
    this.loading = true;
    this.todoService.createTodo(this.newTodo)
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error creating todo:', error);
          alert('Failed to create todo. Check console for details.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.todos.push(response);
          this.resetForm();
        }
      });
  }

  /**
   * Updates an existing todo
   */
  updateTodo(): void {
    if (!this.newTodo.title) {
      alert('Title is required!');
      return;
    }
    
    if (!this.newTodo.id) {
      console.error('Cannot update todo without ID');
      return;
    }
    
    this.loading = true;
    this.todoService.updateTodo(this.newTodo)
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error updating todo:', error);
          alert('Failed to update todo. Check console for details.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && this.editIndex >= 0) {
          this.todos[this.editIndex] = response;
          this.resetForm();
        }
      });
  }

  /**
   * Deletes a todo
   * @param id The ID of the todo to delete
   * @param index The index in the todos array
   */
  deleteTodo(id: number, index: number): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.loading = true;
      this.todoService.deleteTodo(id)
        .pipe(
          finalize(() => this.loading = false),
          catchError(error => {
            console.error('Error deleting todo:', error);
            alert('Failed to delete todo. Check console for details.');
            return of(false);
          })
        )
        .subscribe(success => {
          if (success) {
            this.todos.splice(index, 1);
          }
        });
    }
  }

  /**
   * Toggles the completed status of a todo
   * @param todo The todo to toggle
   */
  toggleStatus(todo: Todo): void {
    const originalStatus = todo.completed;
    todo.completed = !todo.completed;
    
    this.todoService.toggleTodoStatus(todo.id!)
      .pipe(
        catchError(error => {
          console.error('Error toggling todo status:', error);
          alert('Failed to update todo status. Check console for details.');
          todo.completed = originalStatus;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Update the todo with the response data
          Object.assign(todo, response);
        }
      });
  }

  /**
   * Sets up form for editing a todo
   * @param todo The todo to edit
   * @param index The index in the todos array
   */
  editTodo(todo: Todo, index: number): void {
    this.newTodo = { ...todo };
    this.editMode = true;
    this.editIndex = index;
  }

  /**
   * Cancels the current edit operation
   */
  cancelEdit(): void {
    this.resetForm();
  }

  /**
   * Resets the form to its initial state
   */
  resetForm(): void {
    this.newTodo = this.getEmptyTodo();
    this.editMode = false;
    this.editIndex = -1;
  }

  /**
   * Creates an empty Todo object
   */
  private getEmptyTodo(): Todo {
    return {
      id: undefined,
      title: '',
      description: '',
      completed: false,
      createdDate: null,
      completedDate: null
    };
  }

  /**
   * Saves a todo (creates or updates based on edit mode)
   */
  saveTodo(): void {
    if (this.editMode) {
      this.updateTodo();
    } else {
      this.createTodo();
    }
  }

  /**
   * Navigates to the next page
   */
  toggleNextPage(): void {
    this.currentPage++;
    this.loadTodos();
    this.resetForm();
  }

  /**
   * Navigates to the previous page
   */
  togglePrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTodos();
      this.resetForm();
    }
  }

  /**
   * Changes the sort field and handles sort order
   * @param newValue The field to sort by
   */
  toggleSortField(newValue: string): void {
    if (this.sortField === newValue) {
      this.toggleSortOrder();
    } else {
      this.sortOrder = 'asc';
    }
    this.sortField = newValue;
    this.loadTodos();
    this.resetForm();
  }

  /**
   * Toggles between ascending and descending sort order
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }
}