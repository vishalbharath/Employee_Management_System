import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";

const employeeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  department: z.string().trim().min(1).max(100),
  position: z.string().trim().min(1).max(100),
  salary: z.coerce.number().positive().finite(),
});

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, email, department, position,
              salary, created_at, updated_at
       FROM employees
       ORDER BY id DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch employees:", error);

    return NextResponse.json(
      { message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = employeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid employee data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, department, position, salary } =
      parsed.data;

    const result = await pool.query(
      `INSERT INTO employees
         (name, email, department, position, salary)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, department, position,
                 salary, created_at, updated_at`,
      [name, email, department, position, salary]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { message: "An employee with this email already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create employee:", error);

    return NextResponse.json(
      { message: "Failed to create employee" },
      { status: 500 }
    );
  }
}