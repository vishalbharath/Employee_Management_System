import { EmployeeRecord } from "@/lib/validations/employee.schema";

export type ColumnType = "text" | "email" | "number" | "currency" | "date";

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  type: ColumnType;
  searchable?: boolean;
  editable?: boolean;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  min?: string | number;
  step?: string | number;
  colSpan?: 1 | 2;
  formatter?: (value: unknown, record: T) => string;
}

/**
 * Single source of truth for table columns, form inputs, and search fields.
 * To add a new column in the future, simply add its configuration here.
 */
export const EMPLOYEE_COLUMNS: ColumnConfig<EmployeeRecord>[] = [
  {
    key: "id",
    label: "ID",
    type: "number",
    searchable: false,
    editable: false,
  },
  {
    key: "name",
    label: "Full Name",
    type: "text",
    searchable: true,
    editable: true,
    required: true,
    placeholder: "Arun Kumar",
    maxLength: 100,
    colSpan: 1,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    searchable: true,
    editable: true,
    required: true,
    placeholder: "arun@example.com",
    maxLength: 255,
    colSpan: 1,
  },
  {
    key: "department",
    label: "Department",
    type: "text",
    searchable: true,
    editable: true,
    required: true,
    placeholder: "Engineering",
    maxLength: 100,
    colSpan: 1,
  },
  {
    key: "position",
    label: "Position",
    type: "text",
    searchable: true,
    editable: true,
    required: true,
    placeholder: "Software Developer",
    maxLength: 100,
    colSpan: 1,
  },
  {
    key: "salary",
    label: "Monthly Salary (₹)",
    type: "currency",
    searchable: false,
    editable: true,
    required: true,
    placeholder: "45000",
    min: "0.01",
    step: "0.01",
    colSpan: 2,
    formatter: (value) => {
      const num = Number(value);
      if (isNaN(num)) return "₹0.00";
      return num.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      });
    },
  },
];

/**
 * Returns all columns configured for table display.
 */
export function getTableColumns(): ColumnConfig<EmployeeRecord>[] {
  return EMPLOYEE_COLUMNS;
}

/**
 * Returns all columns configured for input in Add/Edit forms.
 */
export function getFormColumns(): ColumnConfig<EmployeeRecord>[] {
  return EMPLOYEE_COLUMNS.filter((col) => col.editable !== false);
}

/**
 * Returns all columns designated as searchable.
 */
export function getSearchableColumns(): ColumnConfig<EmployeeRecord>[] {
  return EMPLOYEE_COLUMNS.filter((col) => col.searchable === true);
}

/**
 * Formats a single cell value based on column definition or default type behavior.
 */
export function formatCellValue(
  column: ColumnConfig<EmployeeRecord>,
  record: EmployeeRecord
): string {
  const value = record[column.key];

  if (column.formatter) {
    return column.formatter(value, record);
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

/**
 * Dynamically filters records against all columns configured as searchable.
 * Eliminates hardcoded query checks across specific fields.
 */
export function filterRecordsBySearch(
  records: EmployeeRecord[],
  searchTerm: string
): EmployeeRecord[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return records;

  const searchableCols = getSearchableColumns();

  return records.filter((record) =>
    searchableCols.some((col) => {
      const val = record[col.key];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(query);
    })
  );
}

