import { apiError, apiSuccess, HttpStatus, parseJsonBody } from "@/lib/http";
import { employeeInputSchema } from "@/lib/validations/employee.schema";
import { employeeService } from "@/services/employee.service";

/**
 * GET /api/employees
 * Fetches all employee records.
 * Status codes: 200 OK, 500 Internal Server Error
 */
export async function GET() {
  try {
    const employees = await employeeService.getAllEmployees();
    return apiSuccess(employees, HttpStatus.OK);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return apiError(
      "Failed to fetch employees",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/employees
 * Creates a new employee record.
 * Status codes:
 * - 201 Created (Success)
 * - 400 Bad Request (Malformed JSON)
 * - 409 Conflict (Duplicate email)
 * - 422 Unprocessable Entity (Schema validation failure)
 * - 500 Internal Server Error (Unexpected failure)
 */
export async function POST(request: Request) {
  try {
    // 1. Guard against malformed JSON syntax (400 Bad Request)
    const jsonResult = await parseJsonBody(request);
    if (!jsonResult.success) {
      return jsonResult.response;
    }

    // 2. Validate request body against Zod schema (422 Unprocessable Entity)
    const parsed = employeeInputSchema.safeParse(jsonResult.data);
    if (!parsed.success) {
      return apiError(
        "Invalid employee data",
        HttpStatus.UNPROCESSABLE_ENTITY,
        parsed.error.flatten()
      );
    }

    const { email } = parsed.data;

    // 3. Read-First Check: Verify email uniqueness prior to write operation (409 Conflict)
    const existingEmployee = await employeeService.getEmployeeByEmail(email);
    if (existingEmployee) {
      return apiError(
        "An employee with this email already exists",
        HttpStatus.CONFLICT
      );
    }

    // 4. Execute Write Operation: Insert new employee (201 Created)
    const newEmployee = await employeeService.createEmployee(parsed.data);

    return apiSuccess(
      newEmployee,
      HttpStatus.CREATED,
      "Employee created successfully"
    );
  } catch (error) {
    // Race-condition fallback for PostgreSQL unique constraint violation
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

    console.error("Failed to create employee:", error);
    return apiError(
      "Failed to create employee",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

}