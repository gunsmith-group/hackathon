const { ProvidePlugin } = require('webpack');

module.exports = function (config, env) {
    return {
        ...config,
        module: {
            ...config.module,
            rules: [
                ...config.module.rules,
                {
                    test: /\.m?[jt]sx?$/,
                    enforce: 'pre',
                    use: ['source-map-loader'],
                },
                {
                    test: /\.m?[jt]sx?$/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
            ],
        },
        plugins: [
            ...config.plugins,
            new ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
            }),
            new ProvidePlugin({
                process: 'process/browser',
            }),
        ],
        resolve: {
            ...config.resolve,
            extensions: [...config.resolve.extensions, ".ts", ".js"],
            fallback: {
                assert: require.resolve('assert'),
                buffer: require.resolve('buffer'),
                // Buffer: require.resolve('buffer'),
                crypto: require.resolve('crypto-browserify'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                stream: require.resolve('stream-browserify'),
                url: require.resolve('url/'),
                util: require.resolve("util/"),
                vm: require.resolve("vm-browserify"),
                zlib: require.resolve('browserify-zlib'),
            },
        },
        ignoreWarnings: [/Failed to parse source map/],
    };
};