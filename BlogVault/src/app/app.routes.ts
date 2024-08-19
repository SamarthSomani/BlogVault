// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { WelcomePageComponent } from './MyComponents/welcome-page/welcome-page.component';
import { BlogsViewComponent } from './MyComponents/blogs-view/blogs-view.component';
import { LoginPageComponent } from './MyComponents/login-page/login-page.component';
import { NewBlogComponent } from './MyComponents/new-blog/new-blog.component';
import { BlogDetailComponent } from './MyComponents/blog-detail/blog-detail.component';
import {CreateAccountComponent} from './MyComponents/create-account/create-account.component'
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'blog-view', component: BlogsViewComponent, canActivate: [AuthGuard] },
  { path: 'login-page', component: LoginPageComponent },
  { path: 'new-blog', component: NewBlogComponent, canActivate: [AuthGuard]},
  { path: 'blog-detail/:id', component: BlogDetailComponent, canActivate: [AuthGuard]},
  { path: 'create-account', component: CreateAccountComponent}
];
