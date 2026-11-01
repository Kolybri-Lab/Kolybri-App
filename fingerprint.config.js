/** @type {import('expo/fingerprint').Config} */
const config = {
  sourceSkips: [
    'ExpoConfigVersions',
    'ExpoConfigNames',
    'ExpoConfigAndroidPackage',
    'ExpoConfigIosBundleIdentifier',
    'ExpoConfigExtraSection',
    'PackageJsonAndroidAndIosScriptsIfNotContainRun',
    'EasJson',
    'Easignore',
    'AutolinkingConfigPaths',
  ],
};

module.exports = config;

