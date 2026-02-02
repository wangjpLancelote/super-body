import { FileText, Upload, Search, Filter, Grid, List, Download, Trash2, Share2 } from 'lucide-react';

export default function FilesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="h-5 w-5" />
              <span>Upload</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px:6 lg:px-8 pb-8">
        {/* Search and View Toggle */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <List className="h-5 w-5" />
              </button>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Storage</h2>
            <span className="text-sm text-gray-600">15.2 GB / 50 GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">30% used</span>
            <span className="text-sm text-gray-600">34.8 GB available</span>
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* File Item 1 */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
            <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 truncate">Project_Report.pdf</h3>
            <p className="text-sm text-gray-500 mb-2">2.4 MB • 2 hours ago</p>
            <div className="flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* File Item 2 */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
            <div className="aspect-square bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 truncate">Budget_2024.xlsx</h3>
            <p className="text-sm text-gray-500 mb-2">856 KB • Yesterday</p>
            <div className="flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* File Item 3 */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
            <div className="aspect-square bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 truncate">Design_Mockup.png</h3>
            <p className="text-sm text-gray-500 mb-2">4.2 MB • 3 days ago</p>
            <div className="flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* File Item 4 */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
            <div className="aspect-square bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-12 w-12 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900 truncate">Meeting_Notes.docx</h3>
            <p className="text-sm text-gray-500 mb-2">156 KB • 1 week ago</p>
            <div className="flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* File Item 5 */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
            <div className="aspect-square bg-red-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="font-medium text-gray-900 truncate">Contract_v2.pdf</h3>
            <p className="text-sm text-gray-500 mb-2">1.8 MB • 2 weeks ago</p>
            <div className="flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* File Item 6 */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer">
            <div className="aspect-square bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-900 truncate">Presentation.pptx</h3>
            <p className="text-sm text-gray-500 mb-2">5.6 MB • 1 month ago</p>
            <div className="flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mt-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-gray-500 mb-4">Support for PDF, DOC, XLS, PPT, PNG, JPG, and more</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Choose Files
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}