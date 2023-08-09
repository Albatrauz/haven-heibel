export default {
  build: {
    rollupOptions: {
      external: /^(@firebase|firestore|firebase|phaser|lodash|react|react-dom)/, // Add the packages you want to exclude from bundling here
    },
  },
  resolve: {
    alias: {
      'firebase/app': 'firebase/app',
      'firebase/firestore': 'firebase/firestore', // Add this alias for Firestore
    },
  },
};
