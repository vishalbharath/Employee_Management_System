"use client";

import React, { useEffect, useState } from "react";
import { getFormColumns } from "@/config/employee-columns";
import { EmployeeInput } from "@/lib/validations/employee.schema";

interface EmployeeFormProps {
  initialValues: Partial<EmployeeInput> | null;
  isEditing: boolean;
  isSubmitting: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  serverError?: string;
  onSubmit: (data: EmployeeInput) => Promise<void> | void;
  onCancel?: () => void;
}

const defaultValues: Record<string, string> = {
  name: "",
  email: "",
  department: "",
  position: "",
  salary: "",
};

/**
 * Dynamically renders form inputs based on EMPLOYEE_COLUMNS configuration.
 * Displays field-level Zod validation errors directly beneath each input.
 */
export function EmployeeForm({
  initialValues,
  isEditing,
  isSubmitting,
  fieldErrors = {},
  serverError,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const formColumns = getFormColumns();
  const [formData, setFormData] = useState<Record<string, string>>(defaultValues);

  // Sync internal state when initialValues change (e.g. when an employee is selected for editing)
  useEffect(() => {
    if (initialValues) {
      const nextValues: Record<string, string> = { ...defaultValues };
      for (const col of formColumns) {
        const key = String(col.key);
        const val = (initialValues as Record<string, unknown>)[key];
        nextValues[key] = val !== undefined && val !== null ? String(val) : "";
      }
      setFormData(nextValues);
    } else {
      setFormData(defaultValues);
    }
  }, [initialValues]);

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submissionPayload = {
      name: formData.name || "",
      email: formData.email || "",
      department: formData.department || "",
      position: formData.position || "",
      salary: Number(formData.salary) || 0,
    } as unknown as EmployeeInput;

    void onSubmit(submissionPayload);
  }

  return (
    <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold text-gray-900">
        {isEditing ? "Edit Employee" : "Add New Employee"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          {formColumns.map((col) => {
            const key = String(col.key);
            const value = formData[key] ?? "";
            const errors = fieldErrors[key];
            const hasError = Boolean(errors && errors.length > 0);

            return (
              <div
                key={key}
                className={col.colSpan === 2 ? "sm:col-span-2" : "sm:col-span-1"}
              >
                <label
                  htmlFor={`field-${key}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {col.label}
                  {col.required && <span className="ml-1 text-red-500">*</span>}
                </label>

                <div className="mt-1.5">
                  <input
                    id={`field-${key}`}
                    type={
                      col.type === "email"
                        ? "email"
                        : col.type === "number" || col.type === "currency"
                        ? "number"
                        : "text"
                    }
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={col.placeholder}
                    maxLength={col.maxLength}
                    min={col.min}
                    step={col.step}
                    required={col.required}
                    disabled={isSubmitting}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `error-${key}` : undefined}
                    className={`w-full rounded-md border p-2.5 text-sm transition-colors outline-none focus:ring-2 disabled:bg-gray-100 disabled:opacity-60 ${
                      hasError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                </div>

                {hasError && errors && (
                  <p
                    id={`error-${key}`}
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {errors[0]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Add Employee"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

