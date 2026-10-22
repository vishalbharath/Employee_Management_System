import { apiError, apiSuccess, HttpStatus, parseJsonBody } from "@/lib/http";
import {
  employeeIdSchema,
  employeeInputSchema,
} from "@/lib/validations/employee.schema";
import { employeeService } from "@/services/employee.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Helper to safely extract and validate the numeric employee ID from route params.
 */
async function parseIdParam(context: RouteContext) {
  const { id: rawId } = await context.params;
  const parsed = employeeIdSchema.safeParse(rawId);

  if (!parsed.success) {
    return {
      success: false as const,
      response: apiError("Invalid employee ID", HttpStatus.BAD_REQUEST),
    };
  }

  return { success: true as const, id: parsed.data };
}

/**
 * GET /api/employees/[id]
 * Fetches a single employee by ID.
 * Status codes:
 * - 200 OK
 * - 400 Bad Request (Invalid ID)
 * - 404 Not Found (Record does not exist)
 * - 500 Internal Server Error
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }

    const employee = await employeeService.getEmployeeById(idResult.id);
    if (!employee) {
      return apiError("Employee not found", HttpStatus.NOT_FOUND);
    }

    return apiSuccess(employee, HttpStatus.OK);
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return apiError(
      "Failed to fetch employee",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/employees/[id]
 * Updates an existing employee.
 * Status codes:
 * - 200 OK (Success)
 * - 400 Bad Request (Invalid ID or malformed JSON)
 * - 404 Not Found (Record does not exist)
 * - 409 Conflict (Duplicate email on another employee)
 * - 422 Unprocessable Entity (Schema validation failure)
 * - 500 Internal Server Error
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    // 1. Validate employee ID param (400 Bad Request)
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }
    const id = idResult.id;

    // 2. Guard against malformed JSON (400 Bad Request)
    const jsonResult = await parseJsonBody(request);
    if (!jsonResult.success) {
      return jsonResult.response;
    }

    // 3. Validate request payload against Zod schema (422 Unprocessable Entity)
    const parsed = employeeInputSchema.safeParse(jsonResult.data);
    if (!parsed.success) {
      return apiError(
        "Invalid employee data",
        HttpStatus.UNPROCESSABLE_ENTITY,
        parsed.error.flatten()
      );
    }

    // 4. Read-First Check: Verify employee exists before attempting update (404 Not Found)
    const existingEmployee = await employeeService.getEmployeeById(id);
    if (!existingEmployee) {
      return apiError("Employee not found", HttpStatus.NOT_FOUND);
    }

    // 5. Read-First Check: Ensure email is not already taken by another employee (409 Conflict)
    const employeeWithEmail = await employeeService.getEmployeeByEmail(
      parsed.data.email
    );
    if (employeeWithEmail && employeeWithEmail.id !== id) {
      return apiError(
        "An employee with this email already exists",
        HttpStatus.CONFLICT
      );
    }

    // 6. Execute Write Operation: Update the employee (200 OK)
    const updated = await employeeService.updateEmployee(id, parsed.data);
    if (!updated) {
      return apiError("Employee not found", HttpStatus.NOT_FOUND);
    }

    return apiSuccess(updated, HttpStatus.OK, "Employee updated successfully");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return apiError(
        "An employee with this email already exists",
        HttpStatus.CONFLICT
      );
    }

    console.error("Failed to update employee:", error);
    return apiError(
      "Failed to update employee",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * DELETE /api/employees/[id]
 * Deletes an employee by ID.
 * Status codes:
 * - 200 OK (Success)
 * - 400 Bad Request (Invalid ID)
 * - 404 Not Found (Record does not exist)
 * - 500 Internal Server Error
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    // 1. Validate employee ID param (400 Bad Request)
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }
    const id = idResult.id;

    // 2. Read-First Check: Verify employee exists before attempting deletion (404 Not Found)
    const existing = await employeeService.getEmployeeById(id);
    if (!existing) {
      return apiError("Employee not found", HttpStatus.NOT_FOUND);
    }

    // 3. Execute Write Operation: Delete the employee (200 OK)
    const deleted = await employeeService.deleteEmployee(id);
    if (!deleted) {
      return apiError("Employee not found", HttpStatus.NOT_FOUND);
    }

    return apiSuccess(deleted, HttpStatus.OK, "Employee deleted successfully");
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return apiError(
      "Failed to delete employee",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
