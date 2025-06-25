// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind }  = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Firebase .cjs support
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = withNativeWind(config, { input: './global.css' })
