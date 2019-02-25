import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Query {
    albumslastfm(search: String!): [Album]
    albums(search: String, last: Int): [Album]
    me: User
  }
  type Mutation {
    signup(
      name: String!
      email: String!
      password: String!
      avatar: String
    ): User
    signin(email: String!, password: String!): User
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
