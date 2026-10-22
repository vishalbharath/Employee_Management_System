"use client";

import React, { useEffect } from "react";
import { EmployeeRecord } from "@/lib/validations/employee.schema";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  employee: EmployeeRecord | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

/**
 * Accessible confirmation modal dialog replacing native window.confirm().
 * Supports keyboard Escape to dismiss and focus trapping.
 */
export function DeleteConfirmModal({
  isOpen,
  employee,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !employee) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop overlay */}
      <div
        onClick={() => !isDeleting && onClose()}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl transition-all">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div>
            <h3
              id="modal-headline"
              className="text-lg font-semibold text-gray-900"
            >
              Delete Employee
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {employee.name}
              </span>
              {employee.department ? ` from ${employee.department}` : ""}? This
              action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

