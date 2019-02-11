const { ApolloServer, gql } = require('apollo-server');

const resolvers = {};

const typeDefs = gql`
  #smth
`;
const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});
