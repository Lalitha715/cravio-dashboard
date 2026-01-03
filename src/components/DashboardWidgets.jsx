import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import { useQuery, gql } from "@apollo/client";

// Example GraphQL queries (replace with real Hasura queries)
const GET_USER_COUNT = gql`
  query GetUsers {
    users_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const DashboardWidgets = () => {
  const [userCount, setUserCount] = useState(0);
  const [restaurantCount, setRestaurantCount] = useState(0);

  // Use Apollo client query (replace with your Hasura GraphQL)
  const { data: usersData } = useQuery(GET_USER_COUNT);

  useEffect(() => {
    if (usersData) {
      setUserCount(usersData.users_aggregate.aggregate.count);
    }
  }, [usersData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard title="Users" value={userCount} color="bg-blue-500" />
      <StatsCard title="Restaurants" value={restaurantCount} color="bg-green-500" />
      <StatsCard title="Orders Today" value={340} color="bg-purple-500" />
      <StatsCard title="Revenue" value="₹45,000" color="bg-orange-500" />
      <StatsCard title="Delivery Boys" value={60} color="bg-pink-500" />
      <StatsCard title="Pending Orders" value={12} color="bg-red-500" />
    </div>
  );
};

export default DashboardWidgets;
