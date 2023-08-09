export default {
  build: {
    rollupOptions: {
      external: /^(@firebase|firestore|firebase|phaser|lodash|react|react-dom)/, // Add the packages you want to exclude from bundling here
    },
  },
};
