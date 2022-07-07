const { shareAll, share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const filename = 'survey_builder';

module.exports = withModuleFederationPlugin({
    name: filename,
    filename: `${filename}.js`,
    exposes: {
        './SettingsModule': './src/app/components/settings/index.ts',
        './SurveyBuilderModule': './src/app/components/survey-builder/index.ts'
    },
    shared: {
        ...shareAll({ strictVersion: true, requiredVersion: 'auto' }),
    }
});