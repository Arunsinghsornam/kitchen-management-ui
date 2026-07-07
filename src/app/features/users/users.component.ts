import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService, User, CreateUser } from './user.service';
import { OutletService, Outlet } from '../outlets/outlet.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  outlets: Outlet[] = [];

  showAddForm = false;
  editing = false;
  editingUserId = '';

  newUser: CreateUser = {
    fullName: '',
    email: '',
    password: '',
    role: 'kitchen_staff',
    outletId: null
  };

  isPowerAdmin = false;
  currentUserId = '';
  organizations: any[] = [];
  selectedOrganizationId = '';

  constructor(
    private userService: UserService,
    private outletService: OutletService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    console.log('UsersComponent initialized');
    
    const user = this.authService.currentUser;
    this.isPowerAdmin = user?.role === 'power_admin';
    this.currentUserId = user?.userId || '';

    if (this.isPowerAdmin) {
      this.loadOrganizations();
    }

    this.loadUsers();
    this.loadOutlets();
  }

  addUser(): void {

    this.editing = false;
    this.editingUserId = '';

    this.newUser = {
      fullName: '',
      email: '',
      password: '',
      role: 'kitchen_staff',
      outletId: null
    };

    this.showAddForm = true;
  }

  editUser(user: User): void {

    this.editing = true;
    this.showAddForm = true;
    this.editingUserId = user.id;

    this.newUser = {
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      outletId: user.outletId ?? null
    };
  }

  saveUser(): void {

    // ===========================
    // UPDATE USER
    // ===========================
    if (this.editing) {

      const updatedUser: any = {
        fullName: this.newUser.fullName,
        role: this.newUser.role,
        outletId: this.newUser.outletId
      };

      if (this.isPowerAdmin) {
        updatedUser.email = this.newUser.email;
      }

      this.userService.updateUser(this.editingUserId, updatedUser).subscribe({

        next: () => {

          alert('User updated successfully');

          this.showAddForm = false;
          this.editing = false;
          this.editingUserId = '';

          this.newUser = {
            fullName: '',
            email: '',
            password: '',
            role: 'kitchen_staff',
            outletId: null
          };

          this.loadUsers();

        },

        error: (err) => {

          console.error(err);
          alert('Failed to update user');

        }

      });

      return;
    }

    // ===========================
    // CREATE USER
    // ===========================

    const user: CreateUser = {
      fullName: this.newUser.fullName,
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role,
      outletId: this.newUser.outletId
    };

    this.userService.createUser(user).subscribe({

      next: () => {

        alert('User created successfully');

        this.showAddForm = false;
        this.editing = false;
        this.editingUserId = '';

        this.newUser = {
          fullName: '',
          email: '',
          password: '',
          role: 'kitchen_staff',
          outletId: null
        };

        this.loadUsers();

      },

      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || err?.error?.title || 'Failed to create user';
        alert(msg);
      }

    });

  }
deleteUser(user: User): void {

  if (!confirm(`Delete ${user.fullName}?`)) {
    return;
  }

  this.userService.deleteUser(user.id).subscribe({

    next: () => {

      alert('User deleted successfully');

      this.loadUsers();

    },

    error: (err) => {

      console.error(err);

      alert('Failed to delete user');

    }

  });

}
resetPassword(user: User): void {

  const newPassword = prompt(
    `Enter a new password for ${user.fullName}:`
  );

  if (!newPassword) {
    return;
  }

  this.userService.resetPassword(user.id, newPassword).subscribe({

    next: () => {

      alert('Password reset successfully.');

    },

    error: (err) => {

      console.error(err);

      alert('Failed to reset password.');

    }

  });

}
  loadUsers(): void {
    this.userService.getUsers(this.selectedOrganizationId).subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadOrganizations(): void {
    this.http.get<any>(`${environment.apiUrl}/api/organizations`).subscribe({
      next: (res) => {
        if (res.success) {
          this.organizations = res.data.filter((o: any) => o.status === 'Approved');
        }
      },
      error: (err) => console.error('Error loading organizations:', err)
    });
  }

  onOrganizationChange(): void {
    this.loadUsers();
  }

  loadOutlets(): void {

    this.outletService.getOutlets().subscribe({

      next: (data) => {

        console.log('Outlets:', data);

        this.outlets = data;

      },

      error: (err) => {

        console.error('Failed to load outlets', err);

      }

    });

  }

}
