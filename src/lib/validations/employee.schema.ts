import { z } from "zod";

/**
 * Single source of truth for Employee input validation.
 */
export const employeeInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters"),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(100, "Department cannot exceed 100 characters"),
  position: z
    .string()
    .trim()
    .min(1, "Position is required")
    .max(100, "Position cannot exceed 100 characters"),
  salary: z.coerce
    .number()
    .positive("Monthly salary must be greater than zero")
    .finite("Monthly salary must be a finite number")
    .max(999999999.99, "Monthly salary cannot exceed 999,999,999.99")
    .refine(
      (val) => {
        const decimalPart = val.toString().split(".")[1];
        return !decimalPart || decimalPart.length <= 2;
      },
      { message: "Monthly salary cannot have more than 2 decimal places" }
    ),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;

export interface EmployeeRecord extends EmployeeInput {
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Route parameter validation schema for Employee ID.
 */
export const employeeIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "Employee ID must be a positive integer")
  .transform((val) => Number(val))
  .refine((num) => Number.isSafeInteger(num), {
    message: "Employee ID is out of safe integer range",
  });

