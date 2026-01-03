import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URL,
  headers: {
    "x-hasura-admin-secret":
      process.env.REACT_APP_HASURA_ADMIN_SECRET,
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
