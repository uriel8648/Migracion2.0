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

  // Common tags with emojis and colors
  commonTags: {name: string, emoji: string, color: string}[] = [
    { name: 'Yoga', emoji: '🧘‍♂️', color: '#FFB6C1' },
    { name: 'GYM', emoji: '🏋️‍♀️', color: '#87CEEB' },
    { name: 'Videogames', emoji: '🎮', color: '#FFD700' },
    { name: 'Study', emoji: '📚', color: '#90EE90' },
    { name: 'Work', emoji: '💼', color: '#FFA07A' }
  ];

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
      completed: [false],
      createdDate: [''],
      createdTime: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {
    // Load todos when component initializes
    this.todoService.todo$.subscribe(todo => {
      this.editTodo(todo);
    });
  }

  // Toggle tag selection
  toggleTag(tagName: string): void {
    const tagsControl = this.todoForm.get('tags');
    if (!tagsControl) return;

    let tagsArray = tagsControl.value ? tagsControl.value.split(',').map((t: string) => t.trim()) : [];

    const index = tagsArray.indexOf(tagName);
    if (index === -1) {
      tagsArray.push(tagName);
    } else {
      tagsArray.splice(index, 1);
    }

    tagsControl.setValue(tagsArray.join(', '));
  }

  // Check if tag is selected
  isTagSelected(tagName: string): boolean {
    const tagsControl = this.todoForm.get('tags');
    if (!tagsControl || !tagsControl.value) return false;

    const tagsArray = tagsControl.value.split(',').map((t: string) => t.trim());
    return tagsArray.includes(tagName);
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

    // Convert tags string to array
    const formValue = this.todoForm.value;
    const tagsArray = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [];
    const newTodo: Todo = {
      ...formValue,
      tags: tagsArray
    };

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
        console.log('Todo created:', createdTodo);
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

    // Convert tags string to array
    const formValue = this.todoForm.value;
    const tagsArray = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [];
    const todoToUpdate: Todo = {
      ...formValue,
      tags: tagsArray
    };

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
       this.todoService.clearTodo();
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
    // Extract date and time from createdDate if available
    let createdDate = '';
    let createdTime = '';
    if (todo.createdDate) {
      const dateObj = new Date(todo.createdDate);
      createdDate = dateObj.toISOString().substring(0, 10); // yyyy-mm-dd
      createdTime = dateObj.toTimeString().substring(0, 5); // HH:mm
    }

    // Convert tags array to comma-separated string
    const tagsString = todo.tags ? todo.tags.join(', ') : '';

    this.todoForm.setValue({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      createdDate: createdDate,
      createdTime: createdTime,
      tags: tagsString
    });
    this.editMode = true;
    // Create a deep copy to avoid modifying the original until save
    //this.editIndex = todo.id;
  }

  // Cancel editing
  cancelEdit(): void {
    this.resetForm();
    this.editMode = false;
    this.todoService.clearTodo();
    this.router.navigate(['/todos']);
  }

  // Reset the form and edit state
  resetForm(): void {
    this.todoForm.reset({
      id: null,
      title: '',
      description: '',
      completed: false,
      createdDate: '',
      createdTime: '',
      tags: ''
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