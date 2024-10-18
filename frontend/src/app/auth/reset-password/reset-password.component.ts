import { Component, Input, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Message } from "../../models/utils";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import Validation from "../register/register.component";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environment";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
})
export class ResetPasswordComponent {
  reset_token: string = "";
  loading = false;
  submitted = false;
  messages: Message[] = [];
  form: FormGroup = new FormGroup({
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
  });

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.reset_token = params["reset"];
    });

    this.form = this.formBuilder.group(
      {
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
    this.http
      .post<Message>(`${environment.api}/reset_password/`, {
        password: this.form.value["password"],
        token: this.reset_token,
      })
      .subscribe({
        next: (message: Message) => {
          this.messages = [];
          this.messages.push(message);
        },
        complete: () => {
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(["/"]); // 3 saniye sonra 'other' rotasına yönlendirme
          }, 3000); // 3000 milisaniye = 3 saniye
        },
      });
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }
}
