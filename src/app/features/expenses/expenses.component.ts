import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense, OtherExpenseItem } from './expense.service';
import { OutletService } from '../outlets/outlet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  outlets: any[] = [];
  
  selectedOutletId: string = '';
  fromDate: string = '';
  toDate: string = '';

  isSuperAdmin: boolean = false;
  isPowerAdmin: boolean = false;

  // Modals state
  showAddForm: boolean = false;
  showEditForm: boolean = false;

  // New/Edit Model
  newExpense!: Expense;
  editingExpense!: Expense;
  newExpenseMonth: string = '';
  editingExpenseMonth: string = '';

  constructor(
    private expenseService: ExpenseService,
    private outletService: OutletService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
    this.isPowerAdmin = user?.role === 'power_admin';

    this.newExpense = this.getEmptyExpense();
    this.editingExpense = this.getEmptyExpense();

    // Default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(today);

    if (this.isSuperAdmin) {
      this.loadOutlets();
    } else {
      this.selectedOutletId = user?.outletId || '';
      this.loadExpenses();
    }
  }

  loadOutlets(): void {
    this.outletService.getOutlets().subscribe({
      next: (res: any) => {
        this.outlets = res;
        if (this.outlets.length > 0) {
          this.selectedOutletId = this.outlets[0].id;
          this.loadExpenses();
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  loadExpenses(): void {
    this.expenseService.getAll(this.selectedOutletId, this.fromDate, this.toDate).subscribe({
      next: (res: any) => {
        this.expenses = res;
      },
      error: (err: any) => console.error(err)
    });
  }

  onFilterChange(): void {
    this.loadExpenses();
  }

  getEmptyExpense(): Expense {
    const user = this.authService.currentUser;
    return {
      outletId: this.isSuperAdmin ? this.selectedOutletId : (user?.outletId || ''),
      expenseDate: this.formatDate(new Date()),
      staffSalary: 0,
      shopRent: 0,
      ebBill: 0,
      gasBill: 0,
      miscExpense: 0,
      otherExpenses: []
    };
  }

  openAddModal(): void {
    this.newExpense = this.getEmptyExpense();
    this.newExpenseMonth = this.formatMonth(new Date());
    this.showAddForm = true;
  }

  addOtherExpenseRow(target: 'new' | 'edit'): void {
    const item: OtherExpenseItem = { description: '', amount: 0 };
    if (target === 'new') {
      this.newExpense.otherExpenses.push(item);
    } else {
      this.editingExpense.otherExpenses.push(item);
    }
  }

  removeOtherExpenseRow(target: 'new' | 'edit', index: number): void {
    if (target === 'new') {
      this.newExpense.otherExpenses.splice(index, 1);
    } else {
      this.editingExpense.otherExpenses.splice(index, 1);
    }
  }

  saveExpense(): void {
    if (!this.newExpense.outletId) {
      alert('Please select an outlet.');
      return;
    }
    if (!this.newExpenseMonth) {
      alert('Please select a month.');
      return;
    }

    this.newExpense.expenseDate = this.newExpenseMonth + '-01';

    // Filter out empty descriptions/amounts
    this.newExpense.otherExpenses = this.newExpense.otherExpenses.filter(x => x.description.trim() !== '');

    this.expenseService.create(this.newExpense).subscribe({
      next: () => {
        alert('Expense recorded successfully.');
        this.showAddForm = false;
        this.loadExpenses();
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.error?.message ?? 'Failed to record expense.');
      }
    });
  }

  openEditModal(item: Expense): void {
    this.editingExpense = {
      ...item,
      otherExpenses: item.otherExpenses.map(o => ({ ...o }))
    };
    this.editingExpenseMonth = item.expenseDate.substring(0, 7);
    this.showEditForm = true;
  }

  saveEditExpense(): void {
    if (!this.editingExpense.id) return;
    if (!this.editingExpenseMonth) {
      alert('Please select a month.');
      return;
    }

    this.editingExpense.expenseDate = this.editingExpenseMonth + '-01';

    this.editingExpense.otherExpenses = this.editingExpense.otherExpenses.filter(x => x.description.trim() !== '');

    this.expenseService.update(this.editingExpense.id, this.editingExpense).subscribe({
      next: () => {
        alert('Expense updated successfully.');
        this.showEditForm = false;
        this.loadExpenses();
      },
      error: (err: any) => {
        console.error(err);
        alert(JSON.stringify(err?.error ?? err));
      }
    });
  }

  deleteExpense(item: Expense): void {
    if (!item.id) return;
    if (confirm(`Are you sure you want to delete this expense record for ${item.expenseDate}?`)) {
      this.expenseService.delete(item.id).subscribe({
        next: () => {
          alert('Expense deleted successfully.');
          this.loadExpenses();
        },
        error: (err: any) => {
          console.error(err);
          alert(err?.error?.message ?? 'Failed to delete expense.');
        }
      });
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  private formatMonth(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    return [year, month].join('-');
  }

  getMonthName(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const date = new Date(parseInt(year, 10), monthIndex, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}
