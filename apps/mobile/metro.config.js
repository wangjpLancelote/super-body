const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  isDeveloper: process.env.NODE_ENV !== 'production',
});

// Add additional Metro configuration
const { generate } = require('@expo/metro-config');

// Watch all files in the src directory
config.watchFolders = ['src'];

// Metro configuration for React Native
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-transformer/src/index.js'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(
    (ext) => ext !== 'svg'
  ),
  sourceExts: [
    ...config.resolver.sourceExts,
    'svg',
    'js',
    'jsx',
    'json',
    'ts',
    'tsx',
  ],
};

// Enable cache for faster builds
config.cacheDirectories = [
  'node_modules/.cache/metro',
  'node_modules/.cache/expo',
];

module.exports = config;