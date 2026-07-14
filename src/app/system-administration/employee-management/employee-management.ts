import { Component, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';

type EmployeeStatus = 'Active' | 'On Leave';
type EmployeeStatusSeverity = 'success' | 'warn';

interface Employee {
  name: string;
  department: string;
  position: string;
  status: EmployeeStatus;
}

@Component({
  selector: 'app-employee-management',
  imports: [Tag, AppBreadcrumb, AppDataTable],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.css',
})
export class EmployeeManagement implements OnInit {
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'System Administration', routerLink: '/system-administration' },
    { label: 'Employee Management' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  employees: Employee[] = [
    { name: 'Fatma Salim', department: 'Legal Affairs', position: 'Legal Officer', status: 'Active' },
    { name: 'Juma Kessy', department: 'ICT', position: 'Systems Administrator', status: 'Active' },
    { name: 'Neema Shirima', department: 'Human Resources', position: 'HR Officer', status: 'On Leave' },
    { name: 'Godfrey Mwakalinga', department: 'Registry', position: 'Registrar', status: 'Active' },
  ];

  statusSeverity(status: EmployeeStatus): EmployeeStatusSeverity {
    return status === 'Active' ? 'success' : 'warn';
  }
}
