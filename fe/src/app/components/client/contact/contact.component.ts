import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {

  addForm!: FormGroup;
  submited = false;

  constructor(private formbuilder : FormBuilder, private contactsv : ContactService){};

  ngOnInit() {
    this.addForm = this.formbuilder.group({
      name: ['',Validators.required],
      dob: ['',Validators.required],
      phone: ['',Validators.required],
      email: ['',Validators.compose([Validators.required,Validators.email])],
      note: ['',Validators.required],
    })
  }

  onsub() {
    this.submited = true;
    if(this.addForm.valid) {
      const {name,dob,phone,email,note} = this.addForm.value;
      this.contactsv.createContact(name,dob,phone,email,note).subscribe({
        next(value) {
            alert('Đã gửi góp ý thành công')
        },
        error(err) {
            console.log('gia tri : ' + err)
            alert('Server Error: ' + err);
        },
      });
    }
    else {
      alert('Vui lòng điền đầy đủ thông tin')
    }
  }
}
