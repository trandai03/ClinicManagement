import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Major } from 'src/app/models/major';
import { MajorService } from 'src/app/services/major.service';

@Component({
  selector: 'app-major',
  templateUrl: './major.component.html',
  styleUrls: ['./major.component.scss']
})
export class MajorComponent {
  // Display, Search, Pagination
  listMajor!:Observable<Major[]>;
  keyword = '';

  constructor(private majorsv : MajorService){};

  ngOnInit() {
    this.listMajor = this.majorsv.getAllMajors();
    this.listMajor.subscribe({
      next(value) {
          console.log(value)
      },
      error(err) {
          console.log('Error!!!',err)
      },
    })
  }

  onSearch() {
    this.listMajor = this.majorsv.getMajorByName(this.keyword);
    this.listMajor.subscribe();
  }

}
