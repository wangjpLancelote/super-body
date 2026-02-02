import { LogoutButton } from '@/auth/components/LogoutButton';
import { User, Activity, Trophy, Settings, Calendar, Target, TrendingUp, DollarSign } from 'lucide-react';
import { StockList } from '@/components/stocks/StockList';
import { StockChart } from '@/components/stocks/StockChart';

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-900">Today</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">This Week</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">This Month</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Card 1 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Tasks</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
          </div>

          {/* Stats Card 2 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
          </div>

          {/* Stats Card 3 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">-3%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Productivity</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">87%</p>
          </div>

          {/* Stats Card 4 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+5</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Achievements</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
          </div>
        </div>

        {/* Stock Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stock Portfolio Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Stock Portfolio</h2>
              </div>
              <span className="text-sm text-green-600 font-medium">+5.2%</span>
            </div>
            <div className="space-y-3">
              {/* Mock portfolio data */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">AAPL</p>
                  <p className="text-sm text-gray-500">10 shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$1,752.30</p>
                  <p className="text-sm text-green-600">+$134.20</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">GOOGL</p>
                  <p className="text-sm text-gray-500">5 shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$692.10</p>
                  <p className="text-sm text-red-600">-$61.50</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">MSFT</p>
                  <p className="text-sm text-gray-500">8 shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$3,031.28</p>
                  <p className="text-sm text-green-600">+$365.48</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value</span>
                <span className="text-xl font-bold text-green-600">$5,475.68</span>
              </div>
            </div>
          </div>

          {/* Real-time Stock Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Real-time AAPL</h2>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            <StockChart symbol="AAPL" height={250} />
          </div>
        </div>

        {/* Stock Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Stock Market Overview</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All Stocks</button>
            </div>
            <StockList showChart={false} />
          </div>

          {/* Market News */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Market News</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
            </div>
            <div className="space-y-4">
              {/* News Item 1 */}
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                  Tech Stocks Rally on AI Optimism
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Major tech companies see gains as AI investments continue to drive market enthusiasm.
                </p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
              {/* News Item 2 */}
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                  Federal Reserve Holds Rates Steady
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fed maintains current interest rates amid ongoing inflation concerns.
                </p>
                <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
              </div>
              {/* News Item 3 */}
              <div>
                <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                  Energy Sector Surges on Strong Earnings
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Energy companies report better-than-expected quarterly results.
                </p>
                <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Activity Chart Visualization</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
            </div>
            <div className="space-y-4">
              {/* Activity Item 1 */}
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Completed workout</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Goal achieved</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Profile updated</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
              <Activity className="h-5 w-5" />
              <span>Log Workout</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
              <Target className="h-5 w-5" />
              <span>Set Goal</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
              <Settings className="h-5 w-5" />
              <span>View Settings</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}