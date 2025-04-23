import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { Major, majors } from '../models/major';
import { Contact, contacts } from '../models/contact';
import { Article, articles } from '../models/article';
import { environment } from '../environment/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  apiUrl = environment.apiBaseUrl;  

  constructor(private http : HttpClient) { }


  getAllArticles() : Observable<Article[]> {
    return this.http.get<apiResponse<Article[]>>(`${this.apiUrl}api/v1/articles`).pipe(
      map( e => {
        console.log(e)
        return e.data
      })
    )
  }

  getArticleByName(keyword : string) {
    return this.http.get<apiResponse<Article[]>>(`${this.apiUrl}api/v1/artilce?name=${keyword}`).pipe(
      map(e => e.data)
    )
  }

  createArticle(formdata : FormData) : Observable<apiResponse<any>> {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/article`,formdata, );
  }

  updateArticle(formdata : FormData, id : number) {
    return this.http.put<apiResponse<any>>(`${this.apiUrl}api/v1/article/${id}`,formdata)
  }


  delete(id : number) : Observable<apiResponse<any>> {
    return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/article/${id}`);
  }
}
