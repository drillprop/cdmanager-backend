import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Albums {
    total: Int
    albums: [Album]
  }

  type SuccessMessage {
    message: String
  }

  type User {
    name: String!
    email: String!
    password: String!
    id: String!
    albums: [Album]
  }

  type Album {
    id: String!
    title: String!
    artist: String!
    image: String
  }

  type FetchedAlbum {
    artist: String!
    title: String!
    imageLarge: String
    imageSmall: String
  }

  type Query {
    albumslastfm(search: String!): [FetchedAlbum]
    albums(skip: Int, limit: Int, search: String): Albums
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
    createAlbum(title: String!, artist: String!, image: String): Album
    deleteAlbum(id: String!): SuccessMessage
  }
`;

export default typeDefs;
