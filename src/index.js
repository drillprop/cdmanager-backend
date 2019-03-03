import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
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

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

server.applyMiddleware({
  app,
  path: '/'
});

app.listen({ port: 4000 }, () => {
  console.log(`server ready at ${server.graphqlPath}`);
});

// todo try setting cors without cors package
