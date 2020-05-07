self.addEventListener('install', function (e) {
    console.debug('Service Worker Registered 2');
    e.waitUntil(
        caches.open('pkuyapp-cache').then(function (cache) {
            console.debug('Service Worker Registered 3');
            return cache.addAll([
                'index.html',
                'pkuyAppCore.js',
                'pkuyAppClient.js',
                'pkuyAppClasses.js',
                'keys/pkuyApp_keys.js'
                // 'resources/img/pkuy-icon-1x.png',
                // 'resources/img/pkuy-icon-2x.png',
                // 'resources/img/pkuy-icon-4x.png',
                // 'resources/img/pkuy-icon-400px.png',
                // 'resources/css/cliente.css',
                // 'resources/fonts/baloo-2/baloo-2.css',
                // 'resources/fonts/baloo-2/baloo-2.woff2',
                // 'resources/fonts/material-icons/material-icons.css',
                // 'resources/fonts/material-icons/MaterialIcons-Regular.ttf',
                // 'resources/fonts/material-icons/MaterialIcons-Regular.woff',
                // 'resources/fonts/material-icons/MaterialIcons-Regular.woff2',
                // 'libs/angular_material/1.1.12/angular-material.min.css',
                // 'libs/angular_material/1.1.12/angular-material.min.js',
                // 'libs/angularjs/1.7.6/angular-animate.min.js',
                // 'libs/angularjs/1.7.6/angular-aria.min.js',
                // 'libs/angularjs/1.7.6/angular-messages.min.js',
                // 'libs/angularjs/1.7.6/angular.min.js',
                // 'libs/apis.google.com/js/api.js',
            ]);
        })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});