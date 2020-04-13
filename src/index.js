import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import db from './db';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ ...req, ...res, db }),
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

server.applyMiddleware({
  app,
  path: '/',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

app.listen({ port: 4000 }, () => {
  console.log(`server ready at ${server.graphqlPath}`);
});
