import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Query {
    albumslastfm(search: String!): [Album]
    albums(search: String, last: Int): [Album]
  }
  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      avatar: String
    ): User
    createCd(title: String!, artist: String!, image: String, id: String): Album
  }
  type User {
    name: String!
    email: String!
    password: String!
    avatar: String
    id: String!
    albums: [Album]
  }
  type Album {
    title: String!
    artist: String!
    image: String
    id: String
  }
`;

export default typeDefs;