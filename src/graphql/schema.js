import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Albums {
    total: Int
    albums: [Album]
  }
  type SuccessMessage {
    message: String
  }
  type Query {
    albumslastfm(search: String!): [Album]
    albums(skip: Int, limit: Int, search: String): Albums
    albumsLength: Int
    me: User
  }
  type Mutation {
    register(
      name: String!
      email: String!
      password: String!
      avatar: String
    ): User
    login(email: String!, password: String!): User
    signout: SuccessMessage
    createAlbum(
      title: String!
      artist: String!
      image: String
      id: String
    ): Album
    deleteAlbum(id: String!): SuccessMessage
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
