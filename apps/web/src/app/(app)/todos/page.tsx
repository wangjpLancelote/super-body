import { List, Plus, Search, Filter, Calendar, CheckCircle, Circle } from 'lucide-react';

export default function TodosPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            <span>New Todo</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search todos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">All</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Active</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Completed</button>
            </div>
          </div>
        </div>

        {/* Todos List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h2>
            <div className="space-y-4">
              {/* Todo Item 1 */}
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <button className="text-gray-400 hover:text-blue-600">
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Morning workout - 30 minutes cardio</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      7:00 AM
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Health</span>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                  </div>
                </div>
              </div>

              {/* Todo Item 2 */}
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <button className="text-blue-600">
                  <CheckCircle className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-through text-gray-500">Review project documentation</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      10:00 AM
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Work</span>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Low</span>
                  </div>
                </div>
              </div>

              {/* Todo Item 3 */}
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <button className="text-gray-400 hover:text-blue-600">
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Prepare presentation for client meeting</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      2:00 PM
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Work</span>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">High</span>
                  </div>
                </div>
              </div>

              {/* Todo Item 4 */}
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <button className="text-gray-400 hover:text-blue-600">
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Grocery shopping</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      5:00 PM
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Personal</span>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks Section */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
            <div className="space-y-4">
              {/* Upcoming Item 1 */}
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <button className="text-gray-400 hover:text-blue-600">
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Doctor appointment</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Tomorrow, 9:00 AM
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Health</span>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
              </div>
              <List className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}