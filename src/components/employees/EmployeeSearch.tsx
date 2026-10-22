"use client";

import React from "react";

interface EmployeeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

/**
 * Accessible search input component with live result count and instant clear capability.
 */
export function EmployeeSearch({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount,
}: EmployeeSearchProps) {
  const isFiltering = searchTerm.trim().length > 0;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <label
          htmlFor="employee-search"
          className="text-sm font-medium text-gray-700"
        >
          Search Employees
        </label>
        <span className="text-xs text-gray-500">
          {isFiltering
            ? `Showing ${filteredCount} of ${totalCount} employees`
            : `Total employees: ${totalCount}`}
        </span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          id="employee-search"
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, department, position..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label="Clear search query"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

