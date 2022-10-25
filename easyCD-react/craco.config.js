const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@redux': path.resolve(__dirname, 'src/redux/'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  }
};