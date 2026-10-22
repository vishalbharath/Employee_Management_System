"use client";

import { useCallback, useEffect, useState } from "react";

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number | string;
};

type EmployeeForm = {
  name: string;
  email: string;
  department: string;
  position: string;
  salary: string;
};

const initialForm: EmployeeForm = {
  name: "",
  email: "",
  department: "",
  position: "",
  salary: "",
};

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<EmployeeForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEmployees = useCallback(async () => {
    try {
      const response = await fetch("/api/employees");

      if (!response.ok) {
        throw new Error("Unable to load employees.");
      }

      const json = await response.json();
      const data: Employee[] = Array.isArray(json) ? json : json.data || [];
      setEmployees(data);
      setError("");
    } catch {
      setError("Could not load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  function updateField(field: keyof EmployeeForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEditing(employee: Employee) {
    setEditingId(employee.id);

    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: String(employee.salary),
    });

    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: number, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete employee.");
      }

      if (editingId === id) {
        cancelEditing();
      }

      setSuccess("Employee deleted successfully.");
      await loadEmployees();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete employee."
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing
          ? `/api/employees/${editingId}`
          : "/api/employees",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            salary: Number(form.salary),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save employee.");
      }

      setForm(initialForm);
      setEditingId(null);
      setSuccess(
        isEditing
          ? "Employee updated successfully."
          : "Employee added successfully."
      );

      await loadEmployees();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">
          Employee Management System
        </h1>
        <p className="mb-8 text-gray-600">
          Add employees and manage your employee records.
        </p>

        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            {editingId !== null ? "Edit Employee" : "Add New Employee"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Full name
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 font-normal"
                  placeholder="Arun Kumar"
                />
              </label>

              <label className="block text-sm font-medium">
                Email
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 font-normal"
                  placeholder="arun@example.com"
                />
              </label>

              <label className="block text-sm font-medium">
                Department
                <input
                  required
                  maxLength={100}
                  value={form.department}
                  onChange={(e) =>
                    updateField("department", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border p-2 font-normal"
                  placeholder="Engineering"
                />
              </label>

              <label className="block text-sm font-medium">
                Position
                <input
                  required
                  maxLength={100}
                  value={form.position}
                  onChange={(e) =>
                    updateField("position", e.target.value)
                  }
                  className="mt-1 w-full rounded-md border p-2 font-normal"
                  placeholder="Software Developer"
                />
              </label>

              <label className="block text-sm font-medium sm:col-span-2">
                Monthly salary (₹)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.salary}
                  onChange={(e) => updateField("salary", e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 font-normal"
                  placeholder="45000"
                />
              </label>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="text-sm text-green-700">
                {success}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Employee"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-md border px-5 py-2.5"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-xl font-semibold">Employee List</h2>
            <p className="mb-5 mt-1 text-sm text-gray-500">
              Total employees: {employees.length}
            </p>

            <div className="mb-5">
              <label
                htmlFor="employee-search"
                className="mb-2 block text-sm font-medium"
              >
                Search Employees
              </label>

              <input
                id="employee-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email, department, or position..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <p className="p-6">Loading employees...</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="p-6 text-gray-600">No employees found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Position</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="p-4">{employee.id}</td>
                      <td className="p-4 font-medium">{employee.name}</td>
                      <td className="p-4">{employee.email}</td>
                      <td className="p-4">{employee.department}</td>
                      <td className="p-4">{employee.position}</td>
                      <td className="p-4">
                        {Number(employee.salary).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => startEditing(employee)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(employee.id, employee.name)}
                            className="font-medium text-red-600 hover:underline"
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
          )}
        </section>
      </div>
    </main>
  );
}
