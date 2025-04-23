import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject, delay, of } from 'rxjs';
import { apiResponse } from 'src/app/models/apiResponse';
import { Major, majors } from 'src/app/models/major';
import { MajorService } from 'src/app/services/major.service';

@Component({
  selector: 'app-major',
  templateUrl: './major.component.html',
  styleUrls: ['./major.component.scss']
})
export class MajorComponent {
  lmajors : any;
  dtOption : DataTables.Settings = {}
  dtTrigger : Subject<any> = new Subject()
  @ViewChild(DataTableDirective, {static: false})
  dtElement!: DataTableDirective;

  addForm !: FormGroup;
  submited = false;

  urlPreview = '';
  fileanh1 : File | null = null;

  itemout: Major = {
    id: 0,
    name: '',
    description: '',
    image: ''
  };
  constructor(private majorSv: MajorService, private formbuilder: FormBuilder, private changRef : ChangeDetectorRef) { };

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers'
    }
    this.majorSv.getAllMajors().subscribe(res => {
      this.lmajors = res;
      // this.changRef.detectChanges()
      this.dtTrigger.next(null)
    })
    this.addForm = this.formbuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      description: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      file: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  get f() {
    return this.addForm.controls;
  }

  loaddata() : void{
    this.majorSv.getAllMajors().subscribe(res => {
      this.lmajors = res;
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
      const {name,description,file} = this.addForm.value;
      const formda = new FormData();
      if (this.fileanh1 !== null) {
        formda.append('file', this.fileanh1);
      }
      const encoder = new TextEncoder();
      const utf8Array = encoder.encode(JSON.stringify({name,description}));
      const binaryString = String.fromCharCode(...utf8Array);
      const base64Encoded = btoa(binaryString);
      formda.append('majordto',base64Encoded)
      this.majorSv.createMajor(formda).subscribe({
        next:(value) => {
          this.loaddata()
          alert('Đã tạo thành công!!!')
        },
        error(value) {
          alert('Có lỗi rồi!!!')
        }
      })
    }
  }

  onupdate() {
    this.submited = true;
    if (!this.addForm.controls['name'].errors && !this.addForm.controls['description'].errors) {
      console.log('ok')
      const {name,description,file} = this.addForm.value;
      const formda = new FormData();
      if (this.fileanh1 !== null ) {
        formda.append('file', this.fileanh1);
      }
      const encoder = new TextEncoder();
      const utf8Array = encoder.encode(JSON.stringify({name,description}));
      const binaryString = String.fromCharCode(...utf8Array);
      const base64Encoded = btoa(binaryString);
      formda.append('majordto',base64Encoded)
      this.majorSv.updateMajor(formda,this.itemout.id).subscribe({
        next:(value) => {
          this.loaddata();
          alert('Đã cập nhật thành công thành công!!!')
        },
        error(value) {
          alert('Có lỗi rồi!!!')
        }
      })
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
  xem(item: Major) {
    this.itemout = item;
    this.fileanh1 = null;
    this.addForm.patchValue({
      name: item.name,
      description: item.description,
    });
    
  }
  xoa(id: number){
    this.majorSv.delete(id).subscribe({
     next:(value) => {
        this.loaddata()
        alert(value.message)
     }, 
     error(err) {
         alert('Đã có lỗi xảy ra')
     },
    })
  }
}
