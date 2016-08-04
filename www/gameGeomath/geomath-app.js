angular.module('geomath', [
    'ui.router', 'oc.lazyLoad', 'semi.storage', 'semi.sound', 'semi.services', 'ngCordova', 'geomath.controllers','angular-svg-round-progressbar'
])
    .config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider){

        window._path = 'gameGeomath/';
        var printscreen = false ;
       console.log('geomath-app');
        window._templatePause = 'templates/pause.html' ;
        $ocLazyLoadProvider.config({
            //debug: true,
            //events: true,
            modules: [{
                name: 'main',
                files: [
                    //_path+'lib/ion.sound.min.js',
                    'lib/semi/sound/browserPolyfill.js',
                    'font/antonio/stylesheet.css',
                    'font/exo2/stylesheet.css',
                    'css/animate.css',
                    _path+'css/style.css',
                    _path+'css/play.css',
                    _path+'css/svg.css',
                    _path+'css/responsive.css',
                    _path+'lib/howler.min.js'
                ]
            }]
        });

        //window._PW = window.innerWidth * window.devicePixelRatio;
        //window._PH = (window.innerHeight * window.devicePixelRatio) - 45 * window.devicePixelRatio;
        window._PW = window.innerWidth;
        window._PH = window.innerHeight - 45;
        
        $stateProvider
            .state('geomath', {
                url: '/geomath',
                abstract: true,
                templateUrl: _path+'templates/game.html',
                controller: 'GeoMathCtrl',
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        //return $ocLazyLoad.load([_path+'js/controllers.js', _path+'js/storage.js']);
                        return $ocLazyLoad.load(['main']);
                    }],
                    sounds: ['SemiSound', function(SemiSound) {
                        var soundFiles = [
                            { name:'fail', fileName:'wrong.mp3' },
                            { name:'success', fileName:'correct.mp3' },
                            { name:'next', fileName:'next.mp3' },
                            { name:'main-play', fileName:'m_play.mp3' },
                            { name:'go-bad', fileName:'go_bad.mp3' },
                            { name:'go-good', fileName:'go_good.mp3' },
                            { name:'go-play', fileName:'go_play.mp3' },
                            { name:'go-main', fileName:'go_main.mp3' },
                            { name:'opengame', fileName:'opengame.mp3' }
                        ];
                        return SemiSound.batchLoadMedia(soundFiles);
                    }]
                }
            })
            .state('geomath.menu', {
                url: '/menu',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/menu.html',
                        controller: 'GeoMathMainCtrl'
                    }
                }
            })
            .state('geomath.play', {
                url: '/play',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/play.html',
                        controller: 'GeoMathPlayCtrl'
                    }
                }
            })
            .state('geomath.pause', {
                url: '/pause',
                views: {
                    'menuContent': {
                        templateUrl: _path+_templatePause,
                        controller: 'GeoMathPlayCtrl'
                    }
                }
            })
            .state('geomath.game-over', {
                url: '/game-over',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/game-over.html' ,
                        controller: 'GeoMathGameOverCtrl'
                    }
                }
            });

        // $urlRouterProvider.otherwise('/game/splash-screen');
    })

;