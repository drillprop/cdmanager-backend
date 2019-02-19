const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    albumslastfm(search: String!): [Album]
    albums(search: String!): [Album]
  }
  type Mutation {
    createCd(title: String!, artist: String!, image: String, id: String): Album
  }
  type Album {
    title: String!
    artist: String!
    image: String
    id: String
  }
`;
module.exports = typeDefs;
