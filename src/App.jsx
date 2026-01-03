import { ApolloProvider } from "@apollo/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import client from "./apolloClient"; // ✅ import client
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Restaurants from "./pages/Restaurants";
import Orders from "./pages/Orders";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";  
import Dishes from "./pages/Dishes";
import Delivery from "./pages/Delivery";

function App() {
  
  return (
    
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:restaurantId/dishes" element={<Dishes />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<h1>Page not found</h1>} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
