import { NextResponse } from "next/server";

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standardized success response helper.
 */
export function apiSuccess<T>(
  data: T,
  status: HttpStatusCode = HttpStatus.OK,
  message?: string
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  return NextResponse.json(body, { status });
}

/**
 * Standardized error response helper.
 */
export function apiError(
  message: string,
  status: HttpStatusCode = HttpStatus.BAD_REQUEST,
  errors?: unknown
) {
  const body: ApiErrorResponse = {
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  };

  return NextResponse.json(body, { status });
}

/**
 * Safely parse JSON from an incoming request.
 * Returns either the parsed body or a 400 Bad Request response.
 */
export async function parseJsonBody<T = unknown>(
  request: Request
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const data = (await request.json()) as T;
    return { success: true, data };
  } catch {
    return {
      success: false,
      response: apiError(
        "Invalid JSON payload in request body",
        HttpStatus.BAD_REQUEST
      ),
    };
  }
}

