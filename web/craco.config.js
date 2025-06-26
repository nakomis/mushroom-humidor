const path = require('path');

module.exports = {
    client: {
        webSocketURL: {
            hostname: 'mushrooms.local.nakomis.com',
        },
    },
    devServer: {
        host: '127.0.0.1',
        server: 'https',
        // https: {
        //     cert: path.resolve(__dirname, 'Certificates.cer'),
        // }
        // server: {
        //     type: 'https',
        //     options: {
        //         ca: './path/to/server.pem',
        //         pfx: './path/to/server.pfx',
        //         key: './path/to/server.key',
        //         cert: './path/to/server.crt',
        //         cert: '/Users/martinharris/repos/nakomis/mushroom-humidor/web/Certificates.cer',
        //         passphrase: 'webpack-dev-server',
        //         requestCert: true,
        //     }
        // }
    },
    webpack: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@images': path.resolve(__dirname, 'src/images'),
            '@config': path.resolve(__dirname, 'src/config'),
        }
    }
};