import React from "react";
import {
  formatCellValue,
  getTableColumns,
} from "@/config/employee-columns";
import { EmployeeRecord } from "@/lib/validations/employee.schema";

interface EmployeeTableProps {
  employees: EmployeeRecord[];
  loading: boolean;
  onEdit: (employee: EmployeeRecord) => void;
  onDelete: (employee: EmployeeRecord) => void;
}

/**
 * Dynamically renders the employee data table based on EMPLOYEE_COLUMNS configuration.
 */
export function EmployeeTable({
  employees,
  loading,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const columns = getTableColumns();

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-base font-medium">No employees found.</p>
        <p className="mt-1 text-xs text-gray-400">
          Try adjusting your search criteria or add a new employee above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="p-4">
                {column.label}
              </th>
            ))}
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="transition-colors hover:bg-gray-50/80"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`p-4 ${
                    column.key === "name" ? "font-medium text-gray-900" : "text-gray-700"
                  }`}
                >
                  {formatCellValue(column, employee)}
                </td>
              ))}
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(employee)}
                    className="rounded px-2.5 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(employee)}
                    className="rounded px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

