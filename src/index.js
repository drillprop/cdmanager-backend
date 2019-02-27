import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import db from './db';
import Mutation from './graphql/resolvers/Mutation';
import Query from './graphql/resolvers/Query';
import typeDefs from './graphql/schema';
const resolvers = { Query, Mutation };

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req, db })
});

app.use(cookieParser());
app.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

const corsOptions = { credentials: true, origin: process.env.FRONTEND_URL };

server.applyMiddleware({ app, path: '/', cors: corsOptions });

app.listen({ port: 4000 }, () => {
  console.log(`server ready at ${server.graphqlPath}`);
});
