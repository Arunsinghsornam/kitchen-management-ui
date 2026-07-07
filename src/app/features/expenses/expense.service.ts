import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OtherExpenseItem {
  id?: string;
  description: string;
  amount: number;
}

export interface Expense {
  id?: string;
  outletId: string;
  outletName?: string;
  expenseDate: string; // YYYY-MM-DD
  staffSalary: number;
  shopRent: number;
  ebBill: number;
  gasBill: number;
  miscExpense: number;
  otherExpenses: OtherExpenseItem[];
  totalAmount?: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/api/expenses`;

  constructor(private http: HttpClient) {}

  getAll(outletId?: string, fromDate?: string, toDate?: string): Observable<Expense[]> {
    let params: any = {};
    if (outletId) params.outletId = outletId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return this.http.get<Expense[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  create(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  update(id: string, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
