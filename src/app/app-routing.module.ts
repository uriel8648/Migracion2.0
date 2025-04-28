import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// These components will be imported from their respective locations
// once they are created during the migration
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { TodoDetailComponent } from './components/todo-detail/todo-detail.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

/**
 * Application routes configuration
 * 
 * Routes:
 * - '' -> Redirects to the todo list
 * - 'todos' -> Displays the list of todos with sorting and pagination
 * - 'todos/new' -> Form to create a new todo
 * - 'todos/:id' -> Displays details of a specific todo
 * - 'todos/:id/edit' -> Form to edit an existing todo
 * - '**' -> Catches all other routes and redirects to the 404 page
 */
export const routes: Routes = [
  { path: '', redirectTo: '/todos', pathMatch: 'full' },
  { path: 'todos', component: TodoListComponent },
  { path: 'todos/new', component: TodoFormComponent },
  { path: 'todos/:id', component: TodoDetailComponent },
  { path: 'todos/:id/edit', component: TodoFormComponent },
  { path: '**', component: PageNotFoundComponent },

 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Using hash strategy to avoid issues with Spring MVC routing
      // Can be changed to PathLocationStrategy with proper server configuration
      useHash: true,
      
      // Enable route tracing for debugging during development
      enableTracing: false,
      
      // Scroll position restoration
      scrollPositionRestoration: 'enabled',
      
      // Relative link resolution
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }