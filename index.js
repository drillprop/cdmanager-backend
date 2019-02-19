const { ApolloServer } = require('apollo-server');
const typeDefs = require('./src/schema.graphql');
const { Mutation } = require('./src/resolvers/Mutation');
const { Query } = require('./src/resolvers/Query');

const resolvers = {
  Mutation,
  Query
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});
