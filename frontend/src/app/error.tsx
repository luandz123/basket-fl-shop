'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-700 mb-4">
          We've encountered an error while loading this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-center"
          >
            Go to home page
          </Link>
        </div>
      </div>
    </div>
  );
}
