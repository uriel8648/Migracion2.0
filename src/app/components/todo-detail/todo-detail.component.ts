import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';
import { finalize, switchMap, take, catchError, tap } from 'rxjs/operators';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'app-todo-detail',
  templateUrl: './todo-detail.component.html',
  styleUrls: ['./todo-detail.component.scss']
})
export class TodoDetailComponent implements OnInit {
  /**
   * The todo being viewed/edited
   */
  todo: Todo = {
    id: 0,
    title: '',
    description: '',
    completed: false,
    createdDate: null,
    completedDate: null
  };

  /**
   * Flag to track if we're in edit mode
   */
  editMode = false;
  
  /**
   * ID of the todo being viewed/edited
   */
  todoId = 0;

  /**
   * Loading state indicator
   */
  loading = false;

  /**
   * Error message to display in the template
   */
  errorMessage: string | null = null;

  constructor(
    private todoService: TodoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get the todo ID from the route parameters using the modern approach
    this.route.paramMap.pipe(
      take(1), // Take only the first emission and complete
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.todoId = +id;
          this.loading = true;
          this.errorMessage = null;
          return this.loadTodo(this.todoId);
        } else {
          // Handle case where no ID is provided
          this.errorMessage = 'No todo ID provided in route.';
          this.router.navigate(['/todos']);
          return EMPTY;
        }
      }),
      catchError(error => {
        console.error('Error in route parameter processing:', error);
        this.errorMessage = 'Error processing route parameters.';
        this.router.navigate(['/todos']);
        return EMPTY;
      }),
      finalize(() => this.loading = false)
    ).subscribe();
  }

  /**
   * Load the todo details from the server
   * @param id The ID of the todo to load
   * @returns An observable of the todo
   */
  loadTodo(id: number): Observable<Todo> {
    return this.todoService.getById(id).pipe(
      catchError(error => {
        console.error('Error loading todo:', error);
        this.errorMessage = 'Failed to load todo details. Check console for details.';
        this.router.navigate(['/todos']);
        return EMPTY;
      }),
      tap((todo: Todo) => {
        this.todo = todo;
        this.errorMessage = null;
      })
    );
  }

  /**
   * Toggle the completed status of the todo
   */
  toggleStatus(): void {
    const originalStatus = this.todo.completed;
    this.todo.completed = !this.todo.completed;
    this.errorMessage = null;
    
    this.todoService.toggleTodoStatus(this.todo.id!).pipe(
      catchError(error => {
        console.error('Error toggling todo status:', error);
        this.errorMessage = 'Failed to update todo status. Check console for details.';
        // Revert to original status on error
        this.todo.completed = originalStatus;
        return EMPTY;
      })
    ).subscribe((updatedTodo: Todo) => {
      // Update the local todo with the response from the server
      this.todo = { ...updatedTodo };
      this.errorMessage = null;
    });
  }

  /**
   * Enable edit mode for this todo by navigating to the edit route
   */
  editTodo(): void {
    this.router.navigate(['/todos', this.todoId, 'edit']);
  }

  /**
   * Update the todo with current values
   */
  updateTodo(): void {
    if (!this.todo.title) {
      this.errorMessage = 'Title is required!';
      return;
    }
    
    this.loading = true;
    this.errorMessage = null;
    this.todoService.updateTodo(this.todo).pipe(
      catchError(error => {
        console.error('Error updating todo:', error);
        this.errorMessage = 'Failed to update todo. Check console for details.';
        return EMPTY;
      }),
      finalize(() => this.loading = false)
    ).subscribe((updatedTodo: Todo) => {
      this.todo = updatedTodo;
      this.editMode = false;
      this.errorMessage = null;
    });
  }

  /**
   * Delete the current todo
   */
  deleteTodo(): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.loading = true;
      this.errorMessage = null;
      this.todoService.deleteTodo(this.todo.id!).pipe(
        catchError(error => {
          console.error('Error deleting todo:', error);
          this.errorMessage = 'Failed to delete todo. Check console for details.';
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      ).subscribe(() => {
        // Navigate back to the todo list after successful deletion
        this.router.navigate(['/todos']);
      });
    }
  }

  /**
   * Cancel editing and revert to view mode
   */
  cancelEdit(): void {
    this.editMode = false;
    this.errorMessage = null;
    // Reload the todo to discard any changes
    this.loading = true;
    this.loadTodo(this.todoId).pipe(
      finalize(() => this.loading = false)
    ).subscribe();
  }

  /**
   * Navigate back to the todo list
   */
  goBack(): void {
    this.router.navigate(['/todos']);
  }
}