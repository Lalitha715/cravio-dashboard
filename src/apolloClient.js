import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const link = new HttpLink({
  uri: "https://sought-shad-46.hasura.app/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "wXhAdwe6ZSKqcitYfoxL05eTxapEwiBdZL5Qr1vw7WBqdQv4gGbKcQH5zh4YMTYr",
  },
});

const client = new ApolloClient({
  link, // pass the HttpLink here
  cache: new InMemoryCache(),
});

export default client;
