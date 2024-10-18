import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { HomeComponent } from "./home/home.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthInterceptorInterceptor } from "./auth/auth-interceptor.interceptor";
import { RegisterComponent } from "./auth/register/register.component";
import { MessageComponent } from "./utils/message/message.component";
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component";
import { UserSettingsComponent } from "src/app/user/user-settings/user-settings.component";
import { AdminComponent } from "./admin/user-dashboard/admin.component";
import { ContentComponent } from "./content/content.component";
import { FileSizePipe } from "./utils/filesize/file-size.pipe";
import { ChatHeaderComponent } from "./dashboard/header/header.component";
import { ChatSidebarComponent } from "./dashboard/sidebar/sidebar.component";
import { ForgetPasswordComponent } from "./auth/forget-password/forget-password.component";
import { NavbarComponent } from "./home/navbar/navbar.component";
import { MainComponent } from "./dashboard/example_page/main.component";

@NgModule({
  declarations: [
    ChatSidebarComponent,
    AppComponent,
    NavbarComponent,
    HomeComponent,
    RegisterComponent,
    MessageComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    ChatHeaderComponent,
    UserSettingsComponent,
    AdminComponent,
    ContentComponent,
    FileSizePipe,
    MainComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
