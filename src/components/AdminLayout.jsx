import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white fixed h-screen top-0 left-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="p-6 bg-gray-100 flex-1 mt-16">{children}</main>
      </div>
    </div>
  );
}

