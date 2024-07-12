import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Blog {
  id: number;
  title: string;
  photo_url: string;
  description: string;
  content_text: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable({ providedIn: 'root' })
export class BlogsService {
  blogs: Blog[] = [];
  scrollHeight!: number;
  constructor(private http: HttpClient) {}

  fetchBlogs(offset: number) {
    return this.http.get<{ blogs: Blog[] }>(
      `https://api.slingacademy.com/v1/sample-data/blog-posts?offset=${offset}&limit=12`
    );
  }
}
