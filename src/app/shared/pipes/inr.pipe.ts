import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "inr", standalone: true })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value ?? 0);
  }
}
