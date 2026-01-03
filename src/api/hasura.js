import { gql } from "@apollo/client";
import client from "../apolloClient";



/* =========================
   USERS
========================= */
export const fetchUsers = async () => {
  const { data } = await client.query({
    query: gql`
      query FetchUsers {
        users {
          id
          name
          email
          phone
          role
          is_active
          created_at
          updated_at
        }
      }
    `,
    fetchPolicy: "no-cache",
  });

  return data.users;
};

/* =========================
   RESTAURANTS
========================= */
export const fetchRestaurants = async () => {
  const { data } = await client.query({
    query: gql`
      query FetchRestaurants {
        restaurants(order_by: { created_at: desc }) {
          id
          name
          email
          phone
          address
          status
          commission_percentage
          open_time
          close_time
          image_url
          hygiene_rating
          created_at
        }
      }
    `,
    fetchPolicy: "no-cache",
  });

  return data.restaurants;
};

/* =========================
   ORDERS (ADMIN)
========================= */
export const fetchOrders = async () => {
  const { data } = await client.query({
    query: gql`
      query FetchOrders {
        orders(order_by: { created_at: desc }) {
          id
          order_number
          total_amount
          status
          created_at

          user {
            name
          }

          order_items {
            dish {
            name
              restaurant {
                name
              }
            }
          }
        }
      }
    `,
    fetchPolicy: "no-cache",
  });

  return data.orders;
};



/* =========================
   DELIVERY BOYS
========================= */
export const fetchDeliveryBoys = async () => {
  const { data } = await client.query({
    query: gql`
      query FetchDeliveryBoys {
        delivery_boys {
          id
          name
          phone
          status
        }
      }
    `,
    fetchPolicy: "no-cache",
  });

  return data.delivery_boys;
};

/* =========================
   DISHES BY RESTAURANT
========================= */
export const fetchDishesByRestaurant = async (restaurantId) => {
  const { data } = await client.query({
    query: gql`
      query FetchDishes($restaurant_id: uuid!) {
        dishes(where: { restaurant_id: { _eq: $restaurant_id } }) {
          id
          restaurant_id
          name
          price
          image_url
          description
          category
          is_available
          discount_percentage
          prep_time
          created_at
        }
      }
    `,
    variables: { restaurant_id: restaurantId },
    fetchPolicy: "no-cache",
  });

  return data.dishes;
};

/* =========================
   ALL DISHES
========================= */

export const fetchAllDishes = async () => {
  const res = await client.query({
    query: gql`
      query {
        dishes(order_by: { created_at: desc }) {
          id
          name
          price
          is_available
          restaurant {
            id
            name
          }
        }
      }
    `,
  });
  return res.data.dishes;
};


/* =========================
   ADD DISH
========================= */
export const addDish = async (dish) => {
  const { data } = await client.mutate({
    mutation: gql`
      mutation AddDish($object: dishes_insert_input!) {
        insert_dishes_one(object: $object) {
          id
          name
        }
      }
    `,
    variables: { object: dish },
  });

  return data.insert_dishes_one;
};

/* =========================
    UPDATE DISH AVAILABILITY
========================= */

export const updateDishAvailability = async (dishId, isAvailable) => {
  const res = await client.mutate({
    mutation: gql`
      mutation UpdateDishAvailability($id: uuid!, $is_available: Boolean!) {
        update_dishes_by_pk(pk_columns: { id: $id }, _set: { is_available: $is_available }) {
          id
        }
      }
    `,
    variables: { id: dishId, is_available: isAvailable },
  });

  return res.data.update_dishes_by_pk;
};


/* =========================
   HYGIENE RATINGS
========================= */
export const fetchHygieneRatings = async () => {
  const { data } = await client.query({
    query: gql`
      query FetchHygieneRatings {
        restaurants(order_by: { hygiene_rating: desc }) {
          id
          name
          hygiene_rating
          updated_at
        }
      }
    `,
    fetchPolicy: "no-cache",
  });

  return data.restaurants;
};

/* =========================
   INSERT ORDER ITEMS
========================= */
export const insertOrderItems = async (order_id, items) => {
  const objects = items.map((i) => ({
    order_id,
    dish_id: i.dish?.id || i.id,
    quantity: i.qty || i.quantity,
    price: i.price,
    restaurant_id: i.restaurant_id,
  }));

  const { data } = await client.mutate({
    mutation: gql`
      mutation InsertOrderItems($objects: [order_items_insert_input!]!) {
        insert_order_items(objects: $objects) {
          affected_rows
        }
      }
    `,
    variables: { objects },
  });

  return data.insert_order_items;
};

/* =========================
   ADD RESTAURANT
========================= */
export const addRestaurant = async (restaurant) => {
  const { data } = await client.mutate({
    mutation: gql`
      mutation AddRestaurant($object: restaurants_insert_input!) {
        insert_restaurants_one(object: $object) {
          id
          name
        }
      }
    `,
    variables: {
      object: restaurant,
    },
  });

  return data.insert_restaurants_one;
};


/* =========================
   UPDATE RESTAURANT STATUS
========================= */
export const updateRestaurantStatus = async (id, status) => {
  const { data } = await client.mutate({
    mutation: gql`
      mutation UpdateRestaurantStatus($id: uuid!, $status: String!) {
        update_restaurants_by_pk(
          pk_columns: { id: $id }
          _set: { status: $status }
        ) {
          id
          status
        }
      }
    `,
    variables: { id, status },
  });

  return data.update_restaurants_by_pk;
};


/* =========================
   UPDATE ORDER STATUS
========================= */
export const updateOrderStatus = async (orderId, status) => {
  const { data } = await client.mutate({
    mutation: gql`
      mutation UpdateOrderStatus($id: uuid!, $status: String!) {
        update_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
          id
          status
        }
      }
    `,
    variables: { id: orderId, status },
  });

  return data.update_orders_by_pk;
};

/* =========================
   REVIEWS
========================= */
export const GET_REVIEWS = gql`
  query GetReviews {
    reviews(order_by: { created_at: desc }) {
      id
      rating
      comment
      status
      created_at
      user {
        name
      }
      restaurant {
        name
      }
    }
  }
`;

export const UPDATE_REVIEW_STATUS = gql`
  mutation UpdateReviewStatus($id: uuid!, $status: String!) {
    update_reviews_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: uuid!) {
    delete_reviews_by_pk(id: $id) {
      id
    }
  }
`;


// Fetch Settings
export const fetchSettings = async () => {
  const { data } = await client.query({
    query: gql`
      query FetchSettings {
        admin_settings(limit: 1) {
          id
          app_name
          support_email
          support_phone
          default_currency
          tax_percentage
          commission_percentage
        }
      }
    `,
    fetchPolicy: "no-cache",
  });
  return data.admin_settings[0] || null;
};

// Update Settings
export const updateSettings = async (id, settings) => {
  const { data } = await client.mutate({
    mutation: gql`
      mutation UpdateSettings($id: uuid!, $set: admin_settings_set_input!) {
        update_admin_settings_by_pk(pk_columns: { id: $id }, _set: $set) {
          id
          app_name
          support_email
          support_phone
          default_currency
          tax_percentage
          commission_percentage
        }
      }
    `,
    variables: { id, set: settings },
  });
  return data.update_admin_settings_by_pk;
};
