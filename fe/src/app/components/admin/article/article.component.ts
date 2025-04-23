import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { Article } from 'src/app/models/article';
import { ArticleService } from 'src/app/services/article.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {
  listArticle: any;
  addForm!: FormGroup;
  submited = false;

  dtOption: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  urlPreview = '';
  fileanh1: File | null = null;

  itemout: Article = {
    id: 0,
    image: '',
    title: '',
    content: '',
    date: '',
  };
  constructor(
    private articleSv: ArticleService,
    private formbuilder: FormBuilder,
    private toastr: ToastrService 
  ) {}

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers',
    };

    this.articleSv.getAllArticles().subscribe((res) => {
      this.listArticle = res;
      this.dtTrigger.next(null);
    });

    this.addForm = this.formbuilder.group({
      title: [
        '',
        Validators.compose([Validators.required, Validators.minLength(10)]),
      ],
      content: [
        '',
        Validators.compose([Validators.required, Validators.minLength(10)]),
      ],
      file: ['', Validators.required],
    });
  }

  get f() {
    return this.addForm.controls;
  }

  loaddata(): void {
    this.articleSv.getAllArticles().subscribe((res) => {
      this.listArticle = res;
    });
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
  }

  onsave() {
    this.submited = true;
    if (!this.addForm.invalid) {
      const { title, content, file } = this.addForm.value;
      const formda = new FormData();
      if (this.fileanh1 !== null) {
        formda.append('file', this.fileanh1);
      }
      const encoder = new TextEncoder();
      const utf8Array = encoder.encode(JSON.stringify({ title, content }));
      const binaryString = String.fromCharCode(...utf8Array);
      const base64Encoded = btoa(binaryString);
      formda.append('articleDto', base64Encoded);
      this.articleSv.createArticle(formda).subscribe({
        next: (value) => {
          this.loaddata();
          alert('Đã tạo thành công!!!');
        },
        error(value) {
          alert('Có lỗi rồi!!!');
        },
      });
    }
  }

  onupdate() {
    this.submited = true;
    if (
      !this.addForm.controls['title'].errors &&
      !this.addForm.controls['content'].errors
    ) {
      const { title, content, file } = this.addForm.value;
      const formda = new FormData();
      if (this.fileanh1 !== null) {
        formda.append('file', this.fileanh1);
      }
      const encoder = new TextEncoder();
      const utf8Array = encoder.encode(JSON.stringify({ title, content }));
      const binaryString = String.fromCharCode(...utf8Array);
      const base64Encoded = btoa(binaryString);
      formda.append('articleDto', base64Encoded);
      this.articleSv.updateArticle(formda, this.itemout.id).subscribe({
        next: (value) => {
          console.log(value);
          this.loaddata();
          alert('Đã cập nhật thành công thành công!!!');
        },
        error(value) {
          console.log(value);
          alert('Có lỗi rồi!!!');
        },
      });
    }
  }

  sb(event: any) {
    const file: File = event.target.files[0];
    this.fileanh1 = file;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.urlPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  xem(item: Article) {
    this.itemout = item;
    this.fileanh1 = null;
    this.addForm.patchValue({
      title: item.title,
      content: item.content,
    });
  }
  xoa(id: number) {
    this.articleSv.delete(id).subscribe({
      next: (value) => {
        this.loaddata();
        alert(value.message);
      },
      error(err) {
        alert('Đã có lỗi xảy ra');
      },
    });
  }

  showSuccess() {
    console.log('chay vao da');
    this.toastr.success('Success message', 'Success');
  }

  showError() {
    console.log('chay vao error');
    this.toastr.error('Error message', 'Error');
  }
}
