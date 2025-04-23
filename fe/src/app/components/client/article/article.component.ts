import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from 'src/app/models/article';
import { ArticleService } from 'src/app/services/article.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent {
  // Display, Search, Pagination
  listArticle!:Observable<Article[]>;

  constructor(private articlesv : ArticleService){};

  ngOnInit() {
    this.listArticle = this.articlesv.getAllArticles();
    this.listArticle.subscribe({
      next(value) {
          console.log(value)
      },
      error(err) {
          console.log('Error!!!',err)
      },
    })
  }

}
