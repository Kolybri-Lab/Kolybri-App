/** @type {import('@expo/fingerprint').Config} */
const config = {
  ignorePaths: [
    'android/**/*',
    'ios/**/*',
    '.expo/**/*',
    'dist/**/*',
    'build/**/*',
    '*.apk',
    '*.aab',
    '*.ipa',
    'eas.json',
    '.easignore',
  ],
  sourceSkips: [
    'ExpoConfigVersions',
    'ExpoConfigNames',
    'ExpoConfigAndroidPackage',
    'ExpoConfigIosBundleIdentifier',
    'ExpoConfigSchemes',
    'ExpoConfigExtraSection',
    'ExpoConfigRuntimeVersionIfString',
    'PackageJsonScriptsAll',
    'GitIgnore',
  ],
};

module.exports = config;
