import { Bot, Send, MessageSquare, FileText, Mic, MicOff, Paperclip, Sparkles } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <FileText className="h-5 w-5" />
              <span>History</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Sparkles className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px:6 lg:px-8 pb-8">
        {/* AI Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <Bot className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
            <p className="text-sm opacity-90">Get intelligent insights and recommendations based on your data</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <MessageSquare className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Natural Conversation</h3>
            <p className="text-sm opacity-90">Chat naturally with AI in plain English</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <FileText className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Document Processing</h3>
            <p className="text-sm opacity-90">Analyze and summarize your uploaded documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Chats</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {/* Chat Item 1 */}
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Health Tips</p>
                      <p className="text-xs text-gray-500 mt-1">"How can I improve my daily routine?"</p>
                      <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Chat Item 2 */}
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Workout Plan</p>
                      <p className="text-xs text-gray-500 mt-1">"Create a weekly workout routine"</p>
                      <p className="text-xs text-gray-400 mt-2">Yesterday</p>
                    </div>
                  </div>
                </div>

                {/* Chat Item 3 */}
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Nutrition Advice</p>
                      <p className="text-xs text-gray-500 mt-1">"Best foods for muscle recovery"</p>
                      <p className="text-xs text-gray-400 mt-2">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Health Assistant</h3>
                      <p className="text-sm text-green-600">Online • Always ready to help</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* AI Message */}
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                      <p className="text-gray-900">Hello! I'm your AI health assistant. I can help you with:</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• Creating personalized workout plans</li>
                        <li>• Nutrition advice and meal planning</li>
                        <li>• Health tracking and progress monitoring</li>
                        <li> • Answering health-related questions</li>
                      </ul>
                      <p className="mt-3 text-gray-900">What would you like help with today?</p>
                    </div>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex items-start space-x-3 flex-row-reverse">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-blue-600 text-white rounded-lg p-4 max-w-3xl ml-auto">
                      <p>I want to start a fitness routine. Can you help me create a plan?</p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                      <p className="text-gray-900">I'd be happy to help you create a fitness plan! To give you the best recommendations, I need to know more about your goals and current fitness level.</p>

                      <div className="mt-4 space-y-3">
                        <p className="font-medium text-gray-900">Quick questions:</p>

                        <div className="space-y-2">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900">1. What's your primary fitness goal?</p>
                            <div className="mt-2 space-y-2">
                              <label className="flex items-center space-x-2 text-sm">
                                <input type="radio" name="goal" className="text-blue-600" />
                                <span>Weight loss</span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input type="radio" name="goal" className="text-blue-600" />
                                <span>Muscle building</span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input type="radio" name="goal" className="text-blue-600" />
                                <span>General fitness</span>
                              </label>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900">2. How many days per week can you exercise?</p>
                            <div className="mt-2 space-y-2">
                              <label className="flex items-center space-x-2 text-sm">
                                <input type="radio" name="days" className="text-blue-600" />
                                <span>2-3 days</span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input type="radio" name="days" className="text-blue-600" />
                                <span>4-5 days</span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input type="radio" name="days" className="text-blue-600" />
                                <span>6-7 days</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                  <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}