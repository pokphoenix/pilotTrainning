angular.module('main', [
    'ui.router', 'oc.lazyLoad', 'semi.storage', 'semi.sound', 'semi.services', 'ngCordova', 'main.controllers'
])
    .config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider){

        window._path = 'main/';

        var printscreen = false ;


        console.log('main-app');
        
        $ocLazyLoadProvider.config({
            //debug: true,
            //events: true,
            modules: [{
                name: 'main',
                files: [
                    //_path+'lib/ion.sound.min.js',
                    'lib/semi/sound/browserPolyfill.js',
                    //_path+'js/controllers.js',
                    //_path+'js/play-controller.js',
                    _path+'css/animate.css',
                    _path+'css/style.css',
                    _path+'css/play.css',
                    _path+'css/svg.css',
                    _path+'css/responsive.css',
                    _path+'font/antonio/stylesheet.css',
                    _path+'font/exo2/stylesheet.css',
                    _path+'lib/howler.min.js'
                ]
            }]
        });

        //window._PW = window.innerWidth * window.devicePixelRatio;
        //window._PH = (window.innerHeight * window.devicePixelRatio) - 45 * window.devicePixelRatio;
        window._PW = window.innerWidth;
        window._PH = window.innerHeight - 45;

        document.addEventListener("deviceready", function () {


        }, false);


        $stateProvider
            .state('main', {
                url: '/main',
                abstract: true,
                templateUrl: _path+'templates/main.html',
                controller: 'GameCtrl',
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
            .state('main.menu', {
                url: '/menu',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/menu.html',
                        controller: 'MainCtrl'
                    }
                }
            })
            .state('main.splash-screen', {
                url: '/splash-screen',
                views: {
                    'menuContent': {
                        templateUrl: _path+'templates/splash-screen.html',
                        controller: 'PreloadCtrl'
                    }
                }
            })
        
        $urlRouterProvider.otherwise('/main/splash-screen');
    })

    .run(function($ionicPlatform,$localStorage,$rootScope,SemiSound,$state,$cordovaStatusbar) {

        $ionicPlatform.ready(function() {

            $ionicPlatform.registerBackButtonAction(function (event) {
                if($state.current.name=="main.menu"){
                    navigator.app.exitApp(); //<-- remove this line to disable the exit
                }else{
                    navigator.app.backHistory();
                }
            }, 100);

            //Sound Settings
            var bReal = true;
            if(bReal) {
                $rootScope.semi = {
                    sound: true,
                    music: false,
                    admob: true,
                    cameCenter: true,
                    hint: false,
                    playCount: 0
                };
            } else {
                $rootScope.semi = {
                    sound: true,
                    music: false,
                    admob: false,
                    cameCenter: false,
                    hint: true,
                    playCount: 0
                };
            }



            document.addEventListener("resume", onResume, false);
            function onResume(){
                $cordovaStatusbar.overlaysWebView(false);
                $cordovaStatusbar.hide();
            }



            document.addEventListener("deviceready", onDeviceReady, false);
            function onDeviceReady() {
                ionic.Platform.fullScreen();
                $cordovaStatusbar.overlaysWebView(false);

                $cordovaStatusbar.hide();
                if(window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.hide();


                }
                screen.lockOrientation('portrait');
            }

            // var BestScore = $localStorage.get( 'BestScore' ) ;
            // if (BestScore==null){
            //     $localStorage.set( 'BestScore' , 0 );
            // }

            $rootScope.deviceReady = true ;
            //SemiSound.play('opengame');

        });
    })
;