import { Component } from "@angular/core";
import { User, UserRegister } from "../../models/user";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
} from "@angular/forms";
import { RegisterService } from "./register.service";
import { Message } from "../../models/utils";

export default class Validation {
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl?.errors && !checkControl.errors["matching"]) {
        return null;
      }

      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  messages: Message[] = [];
  loading = false;
  submitted = false;
  form: FormGroup = new FormGroup({
    first_name: new FormControl(""),
    last_name: new FormControl(""),
    username: new FormControl(""),
    email: new FormControl(""),
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
  });

  constructor(
    private formBuilder: FormBuilder,
    private registerService: RegisterService
  ) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.form = this.formBuilder.group(
      {
        first_name: ["", Validators.required],
        last_name: ["", Validators.required],
        username: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
          ],
        ],
        email: ["", [Validators.required, Validators.email]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
          ],
        ],
        re_password: ["", Validators.required],
      },
      {
        validators: [Validation.match("password", "re_password")],
      }
    );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.registerService.register(this.form.value as UserRegister).subscribe({
      next: (message) => {
        this.messages = [];
        this.messages.push(message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }
}
