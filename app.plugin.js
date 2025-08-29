// app.plugin.js
const {
  withAndroidManifest,
  AndroidConfig,
  withAppBuildGradle,
} = require("expo/config-plugins");

function withReplaceAppComponentFactory(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    // Ensure tools namespace
    manifest.manifest.$ = manifest.manifest.$ || {};
    manifest.manifest.$["xmlns:tools"] =
      manifest.manifest.$["xmlns:tools"] || "http://schemas.android.com/tools";

    // Add tools:replace and make sure appComponentFactory points to AndroidX
    const app = AndroidConfig.Manifest.getMainApplication(manifest);
    if (app) {
      app.$["tools:replace"] = [
        ...(app.$["tools:replace"] ? app.$["tools:replace"].split(",") : []),
        "android:appComponentFactory",
      ]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");
      app.$["android:appComponentFactory"] = "androidx.core.app.CoreComponentFactory";
    }
    return cfg;
  });
}

function withExcludeSupportLibs(config) {
  return withAppBuildGradle(config, (cfg) => {
    const block = `
/**
 * Block legacy Android Support libs that cause manifest conflicts with AndroidX.
 */
configurations.all {
  exclude group: 'com.android.support', module: 'support-compat'
  exclude group: 'com.android.support', module: 'support-core-utils'
  exclude group: 'com.android.support', module: 'support-core-ui'
  exclude group: 'com.android.support', module: 'support-fragment'
  exclude group: 'com.android.support', module: 'animated-vector-drawable'
  exclude group: 'com.android.support', module: 'support-vector-drawable'
  exclude group: 'com.android.support', module: 'versionedparcelable'
}
`;
    if (!cfg.modResults.contents.includes("exclude group: 'com.android.support'")) {
      cfg.modResults.contents += `\n${block}\n`;
    }
    return cfg;
  });
}

module.exports = function (config) {
  config = withReplaceAppComponentFactory(config);
  config = withExcludeSupportLibs(config);
  return config;
};
