import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';
import { Router } from '@angular/router'

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent implements OnInit {
  // Collection of todos
  todos: Todo[] = [];
  
  // Reactive form for better validation and type safety
  todoForm: FormGroup;
  
  // Track edit state
  editMode = false;
  editIndex = -1;
  
  // Pagination and sorting properties
  nextPage = 1;
  sortOrder: 'asc' | 'desc' = 'asc';
  sortField: string = 'ID';
  showNext = false;
  showPrev = false;
  
  // Track loading state for UI feedback
  loading = false;

  constructor(
    private todoService: TodoService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize the form with validators
    this.todoForm = this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      completed: [false]
    });
  }

  ngOnInit(): void {
    // Load todos when component initializes
    this.todoService.todo$.subscribe(todo => {
      this.editTodo(todo);
    });
  }

  // Navigation methods
  toggleNextPage(): void {
    this.nextPage++;
    this.loadTodos();
    this.resetForm();
  }

  togglePrevPage(): void {
    if (this.nextPage > 1) {
      this.nextPage--;
      this.loadTodos();
      this.resetForm();
    }
  }

  // Sorting methods
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

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  // Load all todos using RxJS operators for better error handling
  loadTodos(): void {
    this.loading = true;
    this.todoService.getTodos(this.sortField, this.sortOrder, this.nextPage)
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error loading todos:', error);
          alert('Failed to load todos. Check console for details.');
          return EMPTY;
        })
      )
      .subscribe(data => {
        this.todos = data;
        this.showNext = this.todos.length > 9;
        this.showPrev = this.nextPage > 1;
      });
  }

  // Create a new todo with improved error handling
  createTodo(): void {
    if (this.todoForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.todoForm.controls).forEach(key => {
        const control = this.todoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const newTodo: Todo = this.todoForm.value;
    this.loading = true;
    
    this.todoService.createTodo(newTodo)
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error creating todo:', error);
          alert('Failed to create todo. Check console for details.');
          return EMPTY;
        })
      )
      .subscribe(createdTodo => {
        this.resetForm();
        this.router.navigate(['/todos']);
      });
  }

  // Update an existing todo with improved error handling
  updateTodo(): void {
    if (this.todoForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.todoForm.controls).forEach(key => {
        const control = this.todoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const todoToUpdate: Todo = this.todoForm.value;
    this.loading = true;
    
    this.todoService.updateTodo(todoToUpdate)
      .pipe(
        finalize(() => this.loading = false),
        catchError(error => {
          console.error('Error updating todo:', error);
          alert('Failed to update todo. Check console for details.');
          return EMPTY;
        })
      )
      .subscribe(updatedTodo => {
       this.resetForm();
       this.editMode = false;
       this.router.navigate(['/todos']);
      });
  }

  // Delete a todo with improved error handling
  deleteTodo(id: number, index: number): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.loading = true;
      
      this.todoService.deleteTodo(id)
        .pipe(
          finalize(() => this.loading = false),
          catchError(error => {
            console.error('Error deleting todo:', error);
            alert('Failed to delete todo. Check console for details.');
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.todos.splice(index, 1);
        });
    }
  }

  // Toggle todo status with optimistic updates and rollback on error
  toggleStatus(todo: Todo): void {
    const originalStatus = todo.completed;
    todo.completed = !todo.completed;
    
    this.todoService.toggleTodoStatus(todo.id!)
      .pipe(
        catchError(error => {
          console.error('Error toggling todo status:', error);
          alert('Failed to update todo status. Check console for details.');
          // Rollback optimistic update
          todo.completed = originalStatus;
          return EMPTY;
        })
      )
      .subscribe(updatedTodo => {
        // Update the todo with the response data
        Object.assign(todo, updatedTodo);
      });
  }

  // Edit a todo - load it into the form
  editTodo( todo: Todo): void {
    this.todoForm.setValue({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed
    });
    this.editMode = true;
    // Create a deep copy to avoid modifying the original until save
    //this.editIndex = todo.id;
  }

  // Cancel editing
  cancelEdit(): void {
    this.resetForm();
    this.editMode = false;
    this.router.navigate(['/todos']);
  }

  // Reset the form and edit state
  resetForm(): void {
    this.todoForm.reset({
      id: null,
      title: '',
      description: '',
      completed: false
    });
    this.editMode = false;
    this.editIndex = -1;
  }

  // Save a todo (create or update)
  saveTodo(): void {
    if (this.editMode) {
      this.updateTodo();
    } else {
      this.createTodo();
    }
  }
  
  // Helper method to check if a form control is invalid and touched
  isInvalidAndTouched(controlName: string): boolean {
    const control = this.todoForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}