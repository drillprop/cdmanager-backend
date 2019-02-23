import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Query from './graphql/resolvers/Query';
import Mutation from './graphql/resolvers/Mutation';
import typeDefs from './graphql/schema';

const resolvers = { Query, Mutation };

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req })
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

server.applyMiddleware({ app, path: '/' });

app.listen({ port: 4000 }, () => {
  console.log(`server ready at ${server.graphqlPath}`);
});
