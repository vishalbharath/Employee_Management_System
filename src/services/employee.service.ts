import pool from "@/lib/db";
import {
  EmployeeInput,
  EmployeeRecord,
} from "@/lib/validations/employee.schema";

export const employeeService = {
  /**
   * Fetch all employees ordered by newest ID first.
   */
  async getAllEmployees(): Promise<EmployeeRecord[]> {
    const result = await pool.query<EmployeeRecord>(
      `SELECT id, name, email, department, position,
              salary, created_at, updated_at
       FROM employees
       ORDER BY id DESC`
    );

    return result.rows;
  },

  /**
   * Fetch a single employee by their ID.
   */
  async getEmployeeById(id: number): Promise<EmployeeRecord | null> {
    const result = await pool.query<EmployeeRecord>(
      `SELECT id, name, email, department, position,
              salary, created_at, updated_at
       FROM employees
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Fetch an employee by email (case-insensitive) to support read-before-write validation.
   */
  async getEmployeeByEmail(email: string): Promise<EmployeeRecord | null> {
    const result = await pool.query<EmployeeRecord>(
      `SELECT id, name, email, department, position,
              salary, created_at, updated_at
       FROM employees
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Create a new employee record and return the inserted row.
   */
  async createEmployee(data: EmployeeInput): Promise<EmployeeRecord> {
    const { name, email, department, position, salary } = data;

    const result = await pool.query<EmployeeRecord>(
      `INSERT INTO employees
         (name, email, department, position, salary)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, department, position,
                 salary, created_at, updated_at`,
      [name, email, department, position, salary]
    );

    return result.rows[0];
  },

  /**
   * Update an existing employee and return the updated row.
   */
  async updateEmployee(
    id: number,
    data: EmployeeInput
  ): Promise<EmployeeRecord | null> {
    const { name, email, department, position, salary } = data;

    const result = await pool.query<EmployeeRecord>(
      `UPDATE employees
       SET name = $1,
           email = $2,
           department = $3,
           position = $4,
           salary = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, department, position,
                 salary, created_at, updated_at`,
      [name, email, department, position, salary, id]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Delete an employee by ID and return the deleted record.
   */
  async deleteEmployee(id: number): Promise<EmployeeRecord | null> {
    const result = await pool.query<EmployeeRecord>(
      `DELETE FROM employees
       WHERE id = $1
       RETURNING id, name, email, department, position,
                 salary, created_at, updated_at`,
      [id]
    );

    return result.rows[0] ?? null;
  },
};

