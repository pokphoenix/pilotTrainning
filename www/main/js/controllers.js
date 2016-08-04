angular.module('main.controllers', ['ngAnimate'])

    .controller('PreloadCtrl', function ($rootScope,$timeout,$location) {
        console.log('main.controllers  PreloadCtrl');
        $timeout(function () {
            $location.path('main/menu');
        }, 1500);
    })

    .controller('MainCtrl', function ($rootScope, $scope, $localStorage, $filter, $cordovaAppRate, $location, SemiSound, SemiGC) {

        console.log('main MainCtrl');

        if($rootScope.deviceReady){
            SemiSound.play('opengame');
        }
        $scope.gameSelect = function(path) {
            $rootScope.deviceReady = false;
            console.log('gameSelect path',path);
            $location.path(path);
        };

    })
    .controller('FooterCtrl', function ($scope,$location) {
        $scope.credit = function () {
            $location.path('game/credit');
        };
    })
    .controller('CreditCtrl', function ($scope,$location) {
        $scope.backToMain = function () {
            $location.path('game/main-menu');
        };
    })

    .controller('GameOverCtrl', function ($rootScope, $scope,$location, $localStorage, Semi,$cordovaScreenshot,SemiSound,$cordovaSocialSharing, SemiGC, $timeout) {


        $rootScope.semi.playCount++;

        $scope.gamePlay = function() {
            SemiSound.play('go-play');
        };

        $scope.gameMain = function() {
            SemiSound.play('go-main');
        };



        // -------------
        // -- animations
        // -------------

        var ppActions = {
            'good': [
                ['#dl-cool', '#hn-up', '#fc-smile']
            ],
            'bad': [
                ['#dl-noo', '#hn-down', '#fc-cry'],
                ['#dl-noob', '#hn-noob', '#fc-no'],
                ['#dl-cry', '#hn-down', '#fc-cry'],
                ['#dl-dot', '#hn-noob', '#fc-dot']
            ]
        };


         var androidPng = {
            'good': [
                'pp_game_over_good.png'
            ],
            'bad': [
                'pp_game_over_bad_1.png',
                'pp_game_over_bad_2.png',
                'pp_game_over_bad_3.png',
                'pp_game_over_bad_4.png'
            ]
        };


        var action = ['#dl-cool', '#hn-up', '#fc-smile'];

        var mode = $rootScope.semi.mode;
        if ($rootScope.currentScore >= 20 && (mode == 'easy')){
            var action = ppActions.good[Semi.randomInt(ppActions.good.length-1)];
            var actionAndroidPng = androidPng.good[0] ;

            SemiSound.play('go-good');
        } else if ($rootScope.currentScore >= 40 && ( mode == 'normal' || mode == 'hard' )) {
            var action = ppActions.good[Semi.randomInt(ppActions.good.length-1)];
            var actionAndroidPng = androidPng.good[0] ;

            SemiSound.play('go-good');
        } else {
            var action = ppActions.bad[Semi.randomInt(ppActions.bad.length-1)];
            var actionAndroidPng = androidPng.bad[Semi.randomInt(androidPng.bad.length-1)] ;
            SemiSound.play('go-bad');
        }

        $timeout(function() {

            console.log('action', action);




            if (ionic.Platform.isAndroid()&& parseInt(ionic.Platform.version()) < 5.0 ){
                $scope.actionAndroidPng = actionAndroidPng ;
                console.log('in png');
            }else{

                console.log('in SVG action');

                // hide all first
                var elms = document.querySelectorAll('.go-svg');
                angular.forEach(elms, function (elm, key) {
                    //angular.element(elm).addClass('svg-hide');
                    elm.className = "go-svg svg-hide";
                });

                var dialog = angular.element(document.querySelector(action[0]));
                var hand = angular.element(document.querySelector(action[1]));
                var face = angular.element(document.querySelector(action[2]));

                dialog.removeClass('svg-hide');
                hand.removeClass('svg-hide');
                face.removeClass('svg-hide');
                dialog.addClass('animated fadeInUp t025');
                hand.addClass('animated jello t15');
            }





            //semiAnimate('#dl-noo');
        }, 200);


        // -----------------
        // -- end animations
        // -----------------





    })
;
