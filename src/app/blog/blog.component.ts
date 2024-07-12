import { Component, OnInit } from '@angular/core';
import { BlogService } from './blog.service';
import { Blog } from '../blogs/blogs.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit {
  blog!: Blog;
  id!: number;
  isLoading = false;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.isLoading = true;
      this.getBlog(this.id);
      window.scrollTo({top: 0,behavior: "smooth",});
    });
  }

  getBlog(id: number) {

    if (id !== this.blogService.blog?.id) {
      this.blogService.fetchBlog(id).subscribe((data) => {
        this.blogService.blog = data.blog;
        this.isLoading = false;
        this.blog = this.blogService.blog;
      });
    } else {
      this.isLoading = false;
      this.blog = this.blogService.blog;
    }
  }
}
