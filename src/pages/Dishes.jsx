import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchAllDishes, fetchRestaurants, addDish, updateDishAvailability } from "../api/hasura";

export default function Dishes() {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState(null);

  // Form state for adding a dish
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dishData, restaurantData] = await Promise.all([
        fetchAllDishes(),
        fetchRestaurants(),
      ]);
      setDishes(dishData);
      setRestaurants(restaurantData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dishes or restaurants:", err);
      setError(true);
    }
  };

  const handleAddDish = async () => {
    try {
      await addDish({
        restaurant_id: selectedRestaurant === "all" ? null : selectedRestaurant,
        name,
        price: Number(price),
        image_url: imageUrl,
        description,
        category,
        prep_time: prepTime ? Number(prepTime) : null,
        discount_percentage: discount ? Number(discount) : 0,
        is_available: isAvailable,
      });
      // Refresh dishes list
      const data = await fetchAllDishes();
      setDishes(data);
      setShowAdd(false);
      // Reset form
      setName("");
      setPrice("");
      setImageUrl("");
      setDescription("");
      setCategory("");
      setPrepTime("");
      setDiscount(0);
      setIsAvailable(true);
    } catch (err) {
      console.error("Failed to add dish:", err);
    }
  };

  const toggleAvailability = async (dishId, currentStatus) => {
    try {
      // Assuming updateDishAvailability is a mutation that toggles availability
      await updateDishAvailability(dishId, !currentStatus);
      // Refresh dishes list
      const data = await fetchAllDishes();
      setDishes(data);
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  const filteredDishes =
    selectedRestaurant === "all"
      ? dishes
      : dishes.filter(
        (d) => d.restaurant?.id === selectedRestaurant
      );

  if (loading) return <AdminLayout>Loading Dishes...</AdminLayout>;

  if (error)
    return (
      <AdminLayout>
        <p className="text-red-500">Failed to load dishes</p>
      </AdminLayout>
    );


  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Dishes</h1>

      {/* Restaurant Filter */}
      <div className="mb-4">
        <select
          className="border px-4 py-2 rounded"
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
        >
          <option value="all">All Restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Dish Button */}
      <button
        onClick={() => setShowAdd(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
      >
        Add Dish
      </button>

      {/* Add Dish Form */}
      {showAdd && (
        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Dish</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border rounded px-3 py-2"
              placeholder="Dish Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Preparation Time (min)"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Discount %"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={isAvailable}
              onChange={(e) => setIsAvailable(e.target.value === "true")}
            >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddDish}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dishes Table */}
      {filteredDishes.length === 0 ? (
        <p>No dishes found</p>
      ) : (
        <div className="overflow-auto max-h-[70vh]">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Dish</th>
                <th className="p-3 text-left">Restaurant</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredDishes.map((dish) => (
                <tr key={dish.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{dish.name}</td>
                  <td className="p-3">{dish.restaurant?.name}</td>
                  <td className="p-3">₹{dish.price}</td>
                  <td className="p-3">
                    {dish.is_available ? (
                      <button
                        onClick={() =>
                          toggleAvailability(dish.id, dish.is_available)
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Available
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          toggleAvailability(dish.id, dish.is_available)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Not Available
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
