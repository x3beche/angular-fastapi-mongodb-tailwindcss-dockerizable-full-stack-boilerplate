import { AdminService } from "./admin.service";
import { Component } from "@angular/core";
import { User } from "../../models/user";
import { DropdownInterface, initFlowbite, Modal } from "flowbite";
import { Dropdown } from "flowbite";
import { environment } from "../../environment";
@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
})
export class AdminComponent {
  constructor(private service: AdminService) {}
  users: User[] = [];
  s_user!: User;
  image_api: string = environment.api + "/profile_picture/";
  roles = ["admin", "user", "manager"];
  statuses = ["normal", "suspend"];
  user_save_status = false;
  user_delete_status = false;
  edit_modal!: Modal;
  delete_modal!: Modal;
  roleSelection = {
    user: true,
    admin: true,
    manager: true,
  };
  paginationInfo = {
    page: 1,
    page_size: 10,
    start: 0,
    end: 0,
    total: 0,
    pages: [1],
    search_text: "",
  };

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.service.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.s_user = res[0];
        console.log(this.s_user);
      },
    });

    const $targetEl1 = document.getElementById("dashboard-user-edit-modal");
    this.edit_modal = new Modal($targetEl1);
    const $targetEl2 = document.getElementById("dashboard-user-delete-modal");
    this.delete_modal = new Modal($targetEl2);
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  editUserButton(user_id: string) {
    this.closeDropdown(user_id);
    this.s_user = this.users[this.findUser(user_id)];
    this.edit_modal.show();
  }

  deleteUserButton(user_id: string) {
    this.closeDropdown(user_id);
    this.s_user = this.users[this.findUser(user_id)];
    this.delete_modal.show();
  }

  closeDropdown(id: string): void {
    const $targetEl: HTMLElement | null = document.getElementById(
      id + "-user-dropdown"
    );
    const $triggerEl: HTMLElement | null = document.getElementById(
      id + "-user-dropdown-button"
    );
    const dropdown: DropdownInterface = new Dropdown($targetEl, $triggerEl);

    dropdown.hide();
  }
  openDropdown(id: string): void {
    const $targetEl: HTMLElement | null = document.getElementById(
      id + "-user-dropdown"
    );
    const $triggerEl: HTMLElement | null = document.getElementById(
      id + "-user-dropdown-button"
    );
    const dropdown: DropdownInterface = new Dropdown($targetEl, $triggerEl);

    dropdown.toggle();
  }

  deleteUser(user_id: string): void {
    this.user_delete_status = true;
    this.service.deleteUser(user_id).subscribe({
      next: (res) => {},
      complete: () => {
        this.user_delete_status = false;
        this.delete_modal.hide();
      },
    });
  }

  filter(users: User[]): User[] {
    // Get the selected roles from roleSelection
    const selectedRoles = Object.keys(this.roleSelection).filter(
      (role) => this.roleSelection[role as keyof typeof this.roleSelection]
    );

    // Normalize the search text to lowercase for case-insensitive search
    const normalizedSearchText = this.paginationInfo.search_text
      .trim()
      .toLowerCase();

    // Filter users based on the selected roles and search text (email, first_name, last_name)
    const filteredUsers = users.filter((user) => {
      // Check if user role is in the selected roles
      const roleMatches = selectedRoles.includes(user.role);

      // Check if any of the user's email, first name, or last name contains the search text
      const searchMatches = [
        user.email.toLowerCase(),
        user.first_name.toLowerCase(),
        user.last_name.toLowerCase(),
        user.username.toLowerCase(),
      ].some((field) => field.includes(normalizedSearchText));

      // Return true if both the role and search text match
      return roleMatches && searchMatches;
    });

    // Calculate pagination
    const totalUsers = filteredUsers.length;
    const startIndex =
      (this.paginationInfo.page - 1) * this.paginationInfo.page_size;
    const endIndex = Math.min(
      this.paginationInfo.page * this.paginationInfo.page_size,
      totalUsers
    ); // Limit to total users if less than pageSize

    // Get the paginated users for the current page

    // Generate the pagination info string
    this.paginationInfo.start = startIndex;
    this.paginationInfo.end = endIndex;
    this.paginationInfo.total = totalUsers;

    const totalPages = Math.ceil(totalUsers / this.paginationInfo.page_size);

    // Update the pages array based on total pages
    this.paginationInfo.pages = Array.from(
      { length: totalPages },
      (_, i) => i + 1
    );
    if (this.paginationInfo.page > this.paginationInfo.pages[-1]) {
      this.paginationInfo.page = 0;
    }

    return filteredUsers.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.paginationInfo.page = page;
  }

  editUser(user: User) {
    this.user_save_status = true;
    this.service.updateUser(user).subscribe({
      next: (res) => {
        console.log(res);
      },
      complete: () => {
        this.user_save_status = false;
      },
    });
  }

  findUser(user_id: string): number {
    return this.users.findIndex((u) => u.id === user_id);
  }

  userActivationChange(user_id: string, event: any): void {
    const userIndex = this.findUser(user_id);
    this.users[userIndex].activated = event.target.checked;
    this.editUser(this.users[userIndex]);
  }

  userEditButtonHandler(user_id: string): void {
    const userIndex = this.findUser(user_id);

    /*this.users[userIndex].first_name = this.s_user.first_name;
    this.users[userIndex].last_name = this.s_user.last_name;
    this.users[userIndex].email = this.s_user.email;
    this.users[userIndex].username = this.s_user.username;
    this.users[userIndex].role = this.s_user.role;*/

    this.editUser(this.users[userIndex]);
  }

  userDeleteButtonHandler(user_id: string): void {
    const userIndex = this.findUser(user_id);
    this.users.splice(userIndex, 1);
    this.deleteUser(user_id);
  }
}
