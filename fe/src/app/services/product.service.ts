import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../environment/environment.dev';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  apiUrl = environment.apiBaseUrl;

  constructor(private http : HttpClient) { }

  getAllProduct() : Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}
