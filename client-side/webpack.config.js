const { shareAll, share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const addonConfig = require('../addon.config.json');
const filename = `file_${addonConfig.AddonUUID}`;
// const filename = 'survey_builder';

const webpackConfig = withModuleFederationPlugin({
    name: filename,
    filename: `${filename}.js`,
    exposes: {
        './WebComponents': './src/bootstrap.ts',
    },
    shared: {
        ...shareAll({ strictVersion: true, requiredVersion: 'auto' }),
    }
});

module.exports = {
    ...webpackConfig,
    output: {
        ...webpackConfig.output,
        uniqueName: filename,
    },
};