import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <ShieldX className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          <p className="text-gray-600 mb-8">
            You don't have permission to access this resource. Please contact your administrator or check if you have the required account level.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <Link
              href="/login"
              className="block text-sm text-blue-600 hover:text-blue-800"
            >
              Need to log in with a different account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}