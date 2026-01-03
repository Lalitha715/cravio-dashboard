import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Add/remove pages here as needed
const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "🏠" },
  { name: "Restaurants", path: "/restaurants", icon: "🏪" },
  { name: "Dishes", path: "/dishes", icon: "🍲" },
  { name: "Orders", path: "/orders", icon: "🛒" },
  { name: "Users", path: "/users", icon: "👥" },
  { name: "Delivery",path: "/delivery", icon: "🚚" },
  { name: "Reviews", path: "/reviews", icon: "⭐" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Header inside sidebar */}
      <div className="text-2xl font-bold p-6 border-b border-gray-700">
        Cravio Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left flex items-center gap-2 px-4 py-2 my-1 rounded
              ${
                location.pathname === item.path
                  ? "bg-gray-700"
                  : "hover:bg-blue-800"
              }`}
          >
            {item.icon && <span>{item.icon}</span>} {/* Icon optional */}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
