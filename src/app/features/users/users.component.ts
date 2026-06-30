import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService, User, CreateUser } from './user.service';
import { OutletService, Outlet } from '../outlets/outlet.service';

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

  constructor(
    private userService: UserService,
    private outletService: OutletService
  ) { }

ngOnInit(): void {

  console.log('UsersComponent initialized');

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

      const updatedUser = {
        fullName: this.newUser.fullName,
        role: this.newUser.role,
        outletId: this.newUser.outletId
      };

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
        alert('Failed to create user');

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

  this.userService.getUsers().subscribe({

    next: (response) => {

      console.log(response);

      console.log(response.data);

      console.log(response.data.length);

      this.users = response.data;

      console.log(this.users);

    },

    error: (err) => {
      console.error(err);
    }

  });

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
