// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This line is the one you need to add/ensure is present
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
      'react-native-reanimated/plugin',
    ],
  };
};