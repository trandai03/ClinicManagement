import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginRequest!: FormGroup;
  submited = false;

  constructor(private auth : AuthService, private formbuilder: FormBuilder){};

  ngOnInit() {
    this.loginRequest = this.formbuilder.group({
      username: ['',Validators.compose([Validators.required,Validators.minLength(5)])],
      password: ['',Validators.compose([Validators.required,Validators.minLength(6)])],
      remember: false
    });
  }
  get f() {
    return this.loginRequest.controls;
  }

  onsubmit() {
    this.submited = true;
    if(!this.loginRequest.invalid){
      const {username,password,remember} = this.loginRequest.value
      this.auth.login(username,password).subscribe();
    }
  }
}
