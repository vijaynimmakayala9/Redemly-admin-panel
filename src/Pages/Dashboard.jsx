import React from "react";
import { useState } from "react";
import { FiFolder } from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { FaSearch } from "react-icons/fa";
import { FiBell, FiHelpCircle } from "react-icons/fi";
import {
  FiFolderPlus,
  FiFileText,
  FiUploadCloud,
  FiBriefcase,
} from "react-icons/fi";
import { FiClock } from "react-icons/fi";
const earningsData = [
  { day: "Mon", earnings: 400 },
  { day: "Tue", earnings: 300 },
  { day: "Wed", earnings: 600 },
  { day: "Thu", earnings: 800 },
  { day: "Fri", earnings: 700 },
  { day: "Sat", earnings: 1000 },
  { day: "Sun", earnings: 650 },
];
const hoursData = [
  { hour: "9AM", value: 1 },
  { hour: "10AM", value: 0.8 },
  { hour: "11AM", value: 1.2 },
  { hour: "12PM", value: 0.5 },
  { hour: "1PM", value: 0.7 },
  { hour: "2PM", value: 1.0 },
];
export const quickActions = [
  {
    id: 1,
    label: "New Poster",
    icon: FiFolderPlus,
    color: "text-blue-500",
  },
  {
    id: 2,
    label: "Create Logo",
    icon: FiFileText,
    color: "text-green-500",
  },
  {
    id: 3,
    label: "Orders",
    icon: FiUploadCloud,
    color: "text-purple-500",
  },
  {
    id: 4,
    label: "Payment",
    icon: FiBriefcase,
    color: "text-yellow-500",
  },
];

const Dashboard = () => {
  const [search, setSearch] = useState("");
  return (
    <>
      <div className="h-18 bg-white fixed right-0 top-0 z-50 flex justify-between px-10 items-center gap-20">
      </div>
      <div className="bg-gray-100 min-h-[calc(100vh-3.5rem)] p-8">
        <div className="grid  grid-cols-1 md:grid-cols-[220px_1fr_300px] gap-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="bg-white flex rounded-lg shadow-md justify-between p-4 items-center max-h-max">
              <div className="flex gap-3 items-center">
                <FiFolder className="bg-blue-100 size-8 p-2 rounded-lg text-blue-700" />
                <p className="w-8 text-xl font-semibold leading-tight">
                  Active Users
                </p>
              </div>

              <div className="text-xl">3</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 space-y-8">
              <div className="font-bold text-2xl">Today's Orders</div>
              <div className="space-y-4">
                <div className="flex space-x-2 items-center">
                  <FiClock className="bg-blue-100 size-8 p-2 rounded-lg text-blue-700 items-center" />
                  <p className="font-semibold text-xl">Poster Design Order #101</p>
                </div>

                <p className="text-gray-400 text-l">Due Sept 25 • Start Processing</p>
              </div>
              <div className="space-y-4">
                <div className="flex space-x-2 items-center">
                  <FiClock className="bg-blue-100 size-8 p-2 rounded-lg text-blue-700 items-center" />
                  <p className="font-semibold text-xl">Revisions for Poster Order #102</p>
                </div>

                <p className="text-gray-400 text-l">Client Review • Due Today</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md px-4 py-3">
              <p className="text-sm font-medium">Users</p>
              <div className="flex items-center space-x-2 mt-4">
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Robert"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">Robert</p>
                  <p className="text-xs text-gray-500">1 hr</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <img
                  src="https://randomuser.me/api/portraits/women/2.jpg"
                  alt="Amanda"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">Amanda</p>
                  <p className="text-xs text-gray-500">4 hr</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 w-full items-stretch">
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-md items-center flex flex-col justify-center p-4 h-full">
                  <div className="text-xl mb-1">This Week's Earnings</div>
                  <div className="text-2xl font-bold mb-4">$2,150.00</div>
                  <div className="w-full h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earningsData}>
                        <defs>
                          <linearGradient
                            id="colorEarnings"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#colorEarnings)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-md items-center flex flex-col justify-center p-4 h-full">
                  <div className="flex flex-col items-center gap-2 text-xl mb-1 pt--1">
                    Completed Orders
                    <div className="flex items-center justify-between text-sm mb-1 w-full">
                      15 Orders <FiHelpCircle className="text-gray-400" />
                    </div>
                  </div>

                  <div className="w-full h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hoursData}>
                        <defs>
                          <linearGradient
                            id="colorHours"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="url(#colorHours)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="font-bold mb-2 text-3xl">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-l">
                  + New Poster
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded">
                  Get Posters
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded">
                  Orders
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded">
                  Subcription
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="font-bold mb-4 text-2xl">Quick Actions</div>
              <div className="flex flex-col">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      className="flex items-center justify-between hover:bg-gray-200 p-2 rounded transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-200 p-2 rounded-lg">
                          <Icon className={`text-2xl ${action.color}`} />
                        </div>
                        <span className="text-xl font-medium">
                          {action.label}
                        </span>
                      </div>

                      <div className="text-xl text-gray-500">4 hours</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow-md flex flex-col gap-6 p-4 text-xl font-semibold">
              <div className="text-2xl font-bold">Today's User Birthday</div>
              <div className="space-y-4">
                {/* Example list of users with birthdays today */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/1.jpg"
                      alt="User 1"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="font-medium">Robert</p>
                  </div>
                  <p className="text-sm text-gray-500">25 years old</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/women/2.jpg"
                      alt="User 2"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="font-medium">Amanda</p>
                  </div>
                  <p className="text-sm text-gray-500">30 years old</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/3.jpg"
                      alt="User 3"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="font-medium">David</p>
                  </div>
                  <p className="text-sm text-gray-500">28 years old</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-start space-y-3">
              <div className="font-semibold mb-2 text-2xl">
                Today's User Anniversaries
              </div>
              <div className="space-y-4">
                {/* Example list of users with anniversaries today */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/1.jpg"
                      alt="User 1"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="font-medium">Robert & Sarah</p>
                  </div>
                  <p className="text-sm text-gray-500">5th Anniversary</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/women/2.jpg"
                      alt="User 2"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="font-medium">Amanda & John</p>
                  </div>
                  <p className="text-sm text-gray-500">3rd Anniversary</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/3.jpg"
                      alt="User 3"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="font-medium">David & Emma</p>
                  </div>
                  <p className="text-sm text-gray-500">1st Anniversary</p>
                </div>
              </div>
              <button className="bg-gray-100 text-black text-xl font-semibold py-2 px-4 rounded-lg w-full">
                Celebrate Now
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full justify-between">
              <div className="space-y-5">
                <h2 className="font-semibold text-2xl mb-2">
                  Subscription Plans
                </h2>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>
                      <p className="text-xl">Basic Plan</p>
                      <div className="flex justify-between">
                        <div className="text-gray-500 text-xs">For individuals</div>
                        <div className="text-gray-500 text-xs">$10/month</div>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="text-xl">Professional Plan</p>
                      <div className="flex justify-between">
                        <div className="text-gray-500 text-xs">For small teams</div>
                        <div className="text-gray-500 text-xs">$30/month</div>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 font-bold">•</span>
                    <div>
                      <p className="text-xl">Enterprise Plan</p>
                      <div className="flex justify-between">
                        <div className="text-gray-500 text-xs">For large teams</div>
                        <div className="text-gray-500 text-xs">$75/month</div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;

