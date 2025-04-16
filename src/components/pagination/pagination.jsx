import { useState } from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, isRTL = false }) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 3; // Number of visible pages before and after the current page
        const ellipsis = <span className="px-4 py-2">...</span>;

        // Always show the first page
        pages.push(
            <button
                key={1}
                onClick={() => onPageChange(1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === 1
                        ? "bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                }`}
            >
                1
            </button>
        );

        // Show ellipsis if currentPage is far from the start
        if (currentPage > maxVisiblePages + 1) {
            pages.push(ellipsis);
        }

        // Show pages around the current page
        for (
            let i = Math.max(2, currentPage - maxVisiblePages);
            i <= Math.min(totalPages - 1, currentPage + maxVisiblePages);
            i++
        ) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i
                            ? "bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Show ellipsis if currentPage is far from the end
        if (currentPage < totalPages - maxVisiblePages) {
            pages.push(ellipsis);
        }

        // Always show the last page
        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === totalPages
                            ? "bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                        isRTL ? "ml-3" : "mr-3"
                    }`}
                >
                    {isRTL ? "Next" : "Previous"}
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    {isRTL ? "Previous" : "Next"}
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    {/* <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{" "}
                        <span className="font-medium">{totalPages * 10}</span> results
                    </p> */}
                </div>
                <div>
                    <nav
                        className={`isolate inline-flex -space-x-px rounded-md shadow-sm ${
                            isRTL ? "flex-row-reverse" : ""
                        }`}
                        aria-label="Pagination"
                    >
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                isRTL ? "rounded-r-md rounded-l-none" : ""
                            }`}
                        >
                            <span className="sr-only">Previous</span>
                            {/* Chevron icon (flipped for RTL) */}
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                                style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        {/* Render page numbers */}
                        {renderPageNumbers()}
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                isRTL ? "rounded-l-md rounded-r-none" : ""
                            }`}
                        >
                            <span className="sr-only">Next</span>
                            {/* Chevron icon (flipped for RTL) */}
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                                style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;