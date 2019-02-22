import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import db from './db';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req, db })
});
server.applyMiddleware({ app, path: '/' });

app.listen({ port: 4000 }, () => {
  console.log(`server ready at ${server.graphqlPath}`);
});
