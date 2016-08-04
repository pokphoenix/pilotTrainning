angular.module('semi.services', [])

    .factory('SemiGC', function($q, $ionicPopup) {
        var fac = {};
        var gameCenterReady = false;
        var useGameCenter = true;
        var bUserDisable = false;
        fac.setUseGameCenter = function(val) {
            useGameCenter = val;
        };
        fac.submitScore = function(score, lbId) {
            if(useGameCenter) {
                if(gameCenterReady) {
                    var data = {
                        score: parseInt(score),
                        leaderboardId: lbId
                    };
                    gamecenter.submitScore(function (data) {
                        console.log('GC submit score success: ', data);
                    }, function (data) {
                        console.log('GC submit score failed: ', data);
                    }, data);
                } else {
                    console.log('LB Auth');
                    fac.authGC('score');
                }
            }

        };
        fac.authGC = function(action) {
            if(useGameCenter) {
                // console.log('55666', 55666);
                gamecenter.auth(function(data) {
                    gameCenterReady = true;
                    if(action === undefined) return;
                    if(action == 'show') {
                        //console.log('auth call show!')
                        fac.showLeaderboard();
                    } else if(action == 'score') {
                        //console.log('auth call score!')
                        fac.submitScore();
                    }
                    console.log('Game Center Connected: ', data);
                }, function(data) {
                    if(data.match(/canceled or disabled/g)) {
                        bUserDisable = true;
                        console.log('Match!!!', data);
                    } else {
                        console.log('Failed Connecting Center: ', data);
                    }
                });
            }
        };
        fac.showLeaderboard = function() {
            if(useGameCenter) {
                //console.log('LB Try to show');
                if(gameCenterReady) {
                    //console.log('LB showing!');
                    var data = {
                        leaderboardId: "123456789semimath"
                    };
                    gamecenter.showLeaderboard(function(data) {
                        //console.log('Game Center Connected: ', data);
                    }, function(data) {
                        //console.log('Failed Connecting Center: ', data);
                    }, data);
                } else {
                    if(bUserDisable) {
                        $ionicPopup.alert({
                            title: 'Game Center Unavailable',
                            template: '<p style="text-align: center">Player in not signed in<p>'
                        });
                    }
                    fac.authGC('show');
                }
            }
        };
        return fac ;
    })
    .service('$cordovaScreenshot', ['$q', function ($q){
        return {
            capture: function (filename, extension, quality){
                extension = extension || 'jpg';
                quality = quality || '100';
                var defer = $q.defer();

                navigator.screenshot.save(function (error, res){
                    if (error) {
                        console.error(error);
                        defer.reject(error);
                    } else {
                        console.log('screenshot saved in: ', res.filePath);
                        defer.resolve(res.filePath);
                    }
                }, extension, quality, filename);

                return defer.promise;
            }
        };
    }])
    .factory('Semi', function() {
        var fac = {};
        fac.randomBool = function (c) {
            if(Math.random() <= c) return true;
            return false;
        };
        fac.randomInt = function (min, max)
        {
            if(max === undefined) {
                return Math.floor(Math.random()*(min+1));
            }
            return Math.floor(Math.random()*(max-min+1)+min);
        };
        fac.isDef = function(val) {
            return typeof val === undefined;
        };
        fac.isDevice = function() {
            console.log('ionic.Platform.isIOS()', ionic.Platform.isIOS());
            console.log('ionic.Platform.isAndroid()', ionic.Platform.isAndroid());
            console.log('ionic.Platform.platform()', ionic.Platform.platform());
            return false;
        };
        return fac ;
    })
    .directive('toggleClass', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    element.toggleClass(attrs.toggleClass);
                });
            }
        };
    })
    .directive('soundButtons', function() {
        return {
            restrict: 'E',
            templateUrl: _path+'templates/sound-buttons.html'
        };
    })
    .directive('footerBar', function() {

        window._footerBar = 'templates/footer-bar.html';
        if (ionic.Platform.isAndroid()){
            window._footerBar = 'templates/android/footer-bar-android.html';
        };

        return {
            restrict: 'E',
            templateUrl: _path+_footerBar
        };
    })
    .directive('animation', function($animate, $timeout) {
    return {
        scope: {
            //'myShow': '=',
            'animation': '@',
            'animTime': '@',
            'animEnd': '@',
            'animEndTime': '@',
            'animCallback': '&'
            //'afterShow': '&',
            //'afterHide': '&'
        },
        link: function(scope, element, attrs) {
            //console.log('*** watch', show);
            scope.$watch(function() {return element.attr('class'); }, function(newValue) {
                if(element.hasClass('semi-anim')) {
                    anim(element);
                } else {
                    element.css({'display': 'none', 'amimation': 'none'});
                }
            });

            function anim(e) {
                var animTime = (scope.animTime) ? scope.animTime : 0.5;
                var endTime = (scope.animEndTime) ? scope.animEndTime : 0.5;
                var delay = 0.5;
                e.css({'animation': scope.animation+' '+animTime+'s', 'display': 'block' ,
                    '-webkit-animation' : scope.animation+' '+animTime+'s'
                });
                $timeout(function () {
                    e.css({'animation': scope.animEnd+' '+endTime+'s', '-webkit-animation' : scope.animEnd+' '+endTime+'s'});
                    $timeout(function () {
                        scope.animCallback();
                        element.css({'display': 'none', 'amimation': 'none'});
                        e.removeClass('semi-anim');
                    }, endTime*1000 - 100);
                }, animTime*1000 + delay*1000);
            }
        }
    }
})
;


