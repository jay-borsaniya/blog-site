import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { Blog, BlogsService } from './blogs.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css'],
})
export class BlogsComponent implements OnInit, AfterViewInit {
  blogs: Blog[] = this.blogsService.blogs;
  isLoading = false;
  isInfiniteScrollLoading = false;
  isLimitReached = false;

  constructor(private blogsService: BlogsService) {}

  ngOnInit() {
    if (this.blogs.length === 0) {
      this.isLoading = true;
      this.getBlogs();
    }
  }

  ngAfterViewInit(): void {
    if (this.blogsService.scrollHeight) {
      window.scrollTo(0, this.blogsService.scrollHeight);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: any) {
    this.blogsService.scrollHeight = window.scrollY;

    if (this.blogs.length >= 1000) {
      this.isLimitReached = true;
      return;
    }
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !this.isInfiniteScrollLoading
    ) {
      this.isInfiniteScrollLoading = true;
      this.getBlogs();
    }
  }

  getBlogs() {
    this.blogsService.fetchBlogs(this.blogs.length).subscribe((data) => {
      this.blogsService.blogs.push(...data.blogs);
      this.isLoading = false;
      this.isInfiniteScrollLoading = false;
    });
  }
}
