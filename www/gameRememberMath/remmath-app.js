angular.module('remmath', [
    'ui.router', 'oc.lazyLoad', 'semi.storage', 'semi.sound', 'semi.services', 'ngCordova', 'remmath.controllers','angular-svg-round-progressbar','ngDraggable','ngDragDrop','lvl.directives.dragdrop','laneolson.ui.dragdrop'
])
    .config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider){

        window._path = 'gameRemembermath/';
        var printscreen = false ;
       console.log('remmath-app');
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
            .state('remmath', {
                url: '/remmath',
                abstract: true,
                templateUrl: _path+'templates/game.html',
                controller: 'RemMathCtrl',
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
            .state('remmath.menu', {
                url: '/menu',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/menu.html',
                        controller: 'RemMathMainCtrl'
                    }
                }
            })
            .state('remmath.play', {
                url: '/play',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/play.html',
                        controller: 'RemMathPlayCtrl'
                    }
                }
            })


            .state('remmath.remember', {
                url: '/remember',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/remember.html',
                        controller: 'RemMathRemCtrl'
                    }
                }
            })

            .state('remmath.math', {
                url: '/math',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/math.html',
                        controller: 'RemMathCalCtrl'
                    }
                }
            })
            .state('remmath.pause', {
                url: '/pause',
                views: {
                    'menuContent': {
                        templateUrl: _path+_templatePause,
                        controller: 'RemMathPlayCtrl'
                    }
                }
            })



            .state('remmath.show-score', {
                url: '/show-score',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/show-score.html' ,
                        controller: 'RemMathShowMathScoreCtrl'
                    }
                }
            })
            .state('remmath.game-over', {
                url: '/game-over',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/game-over.html' ,
                        controller: 'RemMathGameOverCtrl'
                    }
                }
            });

        // $urlRouterProvider.otherwise('/game/splash-screen');
    })

;