'use client';

import { useAuth } from '@/auth/hooks/useAuth';
import { Button } from '@/lib/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Continue your health journey with LifeByte
            </p>
            <div className="space-y-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full max-w-md">
                  <Activity className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full max-w-md">
                  Switch Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Health Tracking</CardTitle>
                <CardDescription>
                  Monitor your vital signs and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Track your progress with comprehensive health monitoring tools.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>
                  Get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI-powered insights to help you achieve your health goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Analysis</CardTitle>
                <CardDescription>
                  Visualize your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Detailed analytics to track your health journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LifeByte
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered health and fitness tracking application
          </p>
          <div className="space-y-4">
            <Link href="/login">
              <Button size="lg" className="w-full max-w-md">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full max-w-md">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Smart Tracking</CardTitle>
              <CardDescription>
                Automatically track your health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our AI-powered system monitors your health patterns and provides insights.
              </p>
            </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalized Plans</CardTitle>
              <CardDescription>
                Customized health recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get tailored health plans based on your unique needs and goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Monitoring</CardTitle>
              <CardDescription>
                Stay motivated with visual progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track your improvement over time with detailed analytics and charts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}