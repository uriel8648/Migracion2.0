import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Todo } from '../models/todo.model';
import { environment } from '../../environments/environment';

/**
 * TodoService - Handles all CRUD operations for Todo items
 * 
 * This service manages all API interactions for Todo entities.
 * Uses modern Angular HttpClient and RxJS patterns.
 */


@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // Base API URL from environment config
  private apiUrl = 'http://localhost:8080/todo/api/todos'; //
  
  constructor(private http: HttpClient) {}

  /**
   * Fetches todos with sorting and pagination
   * @param sortField Field to sort by
   * @param sortOrder Sort direction ('asc' or 'desc')
   * @param page Page number (1-based)
   * @returns Observable of Todo array
   */
  getTodos(sortField: string = 'ID', sortOrder: string = 'asc', page: number = 1): Observable<Todo[]> {
    let params = new HttpParams()
      .set('sortField', sortField)
      .set('sortOrder', sortOrder)
      .set('page', page.toString());

    return this.http.get<Todo[]>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new todo
   * @param todo Todo object to create
   * @returns Observable of created Todo
   */
  createTodo(todo: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Updates an existing todo
   * @param todo Todo object to update
   * @returns Observable of updated Todo
   */
  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todo.id}`, todo)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deletes a todo by ID
   * @param id Todo ID to delete
   * @returns Observable of void
   */
  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Toggles the completed status of a todo
   * @param id Todo ID to toggle
   * @returns Observable of updated Todo
   */
  toggleTodoStatus(id: number): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}/toggle`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handles HTTP errors and converts them to an Observable error
   * @param error The HTTP error response
   * @returns An Observable error with a user-friendly message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 200 && error.ok === false) {
      // Edge case: status 200 but ok false, treat as success or handle gracefully
      console.warn('API Warning: Received HttpErrorResponse with status 200 but ok false. Treating as success.');
      // Return empty observable to prevent error propagation
      return new Observable<never>((observer) => {
        observer.complete();
      });
    }

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error('API Error:', error);
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Determines if the "Next" page button should be shown
   * @param todos Current list of todos
   * @returns Boolean indicating if Next button should be shown
   */
  shouldShowNextButton(todos: Todo[]): boolean {
    return todos.length > 9;
  }

  /**
   * Determines if the "Previous" page button should be shown
   * @param currentPage Current page number
   * @returns Boolean indicating if Previous button should be shown
   */
  shouldShowPrevButton(currentPage: number): boolean {
    return currentPage > 1;
  }

  /**
   * Fetches a todo by its ID
   * @param id Todo ID to fetch
   * @returns Observable of Todo
   */
  getById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}
