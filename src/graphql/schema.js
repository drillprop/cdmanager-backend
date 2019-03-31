import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type SuccessMessage {
    message: String
  }
  type Query {
    albumslastfm(search: String!): [Album]
    albumsCollection(search: String!): [Album]
    albums(last: Int): [Album]
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
