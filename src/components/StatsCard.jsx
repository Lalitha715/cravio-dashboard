import React from "react";

const StatsCard = ({ title, value, color, onClick }) => {
  return (
    <div
      className={`p-6 rounded-lg text-white ${color} shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <h3 className="text-lg">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default StatsCard;
