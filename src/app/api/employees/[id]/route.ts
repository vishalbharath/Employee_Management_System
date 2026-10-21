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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id: rawId } = await context.params;

    // Validate the employee ID.
    if (!/^[1-9]\d*$/.test(rawId)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    const id = Number(rawId);

    if (!Number.isSafeInteger(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Validate the submitted employee data.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

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

    const { name, email, department, position, salary } = parsed.data;

    // Update the matching employee in PostgreSQL.
    const result = await pool.query(
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

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
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

    console.error("Failed to update employee:", error);

    return NextResponse.json(
      { message: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id: rawId } = await context.params;

    if (!/^[1-9]\d*$/.test(rawId)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    const id = Number(rawId);

    if (!Number.isSafeInteger(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM employees
       WHERE id = $1
       RETURNING id, name`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Employee deleted successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to delete employee:", error);

    return NextResponse.json(
      { message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
