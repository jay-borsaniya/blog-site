import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Blog } from '../blogs/blogs.service';

@Injectable({ providedIn: 'root' })
export class BlogService {
  blog!: Blog

  constructor(private http: HttpClient) {}

  fetchBlog(id: number) {
    return this.http
      .get<{ blog: Blog}>(
        `https://api.slingacademy.com/v1/sample-data/blog-posts/${id}`
      )
  }
}
