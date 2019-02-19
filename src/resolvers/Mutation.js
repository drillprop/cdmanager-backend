module.exports = {
  Mutation: {
    createCd: async (parent, args, ctx, info) => {
      let { title, artist, image, id } = args;
      global.albums = global.albums || [];
      let album = {
        title,
        artist,
        image,
        id
      };
      global.albums.push(album);
      return album;
    }
  }
};
