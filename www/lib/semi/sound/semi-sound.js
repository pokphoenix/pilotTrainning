angular.module('semi.sound', ['ionic'])

// for media plugin : http://plugins.cordova.io/#/package/org.apache.cordova.media
    .factory('SemiSound', function($q, $ionicPlatform, $window, $interval, $rootScope){
        var service = {
            loadMedia: loadMedia,
            getStatusMessage: getStatusMessage,
            getErrorMessage: getErrorMessage,
            batchLoadMedia: batchLoadMedia,
            play: play,
            stop: stop
        };

        var sounds = {};


        function batchLoadMedia(soundFiles) {
            var defer = $q.defer();
            //window.playSound = function(sound) {
            //    sounds[sound].play();
            //};
            //window.stopSound = function(sound) {
            //    sounds[sound].stop();
            //};
            var soundCheck;
            for(var i = 0; i < soundFiles.length; i++) {
                var isMusic = false;
                if(soundFiles[i].isMusic !== undefined) {
                    isMusic = soundFiles[i].isMusic;
                }
                loadMedia('sound/'+soundFiles[i].fileName, soundFiles[i].name, isMusic).then(function (media) {
                    sounds[media.name] = media;
                });
            }
            soundCheck = $interval(function() {
                var fin = true;
                for(var i = 0; i < soundFiles.length; i++) {
                    if(!angular.isDefined(sounds[soundFiles[i].name])) {
                        fin = false
                    }
                }
                if(fin) {
                    console.log('sound loaded');
                    $interval.cancel(soundCheck);
                    defer.resolve(sounds);
                }
            }, 1000);

            return defer.promise;
        }

        function play(sound) {
            if(sounds[sound].isMusic && $rootScope.semi.music) {
                sounds[sound].play({
                    numberOfLoops: 999,
                    playAudioWhenScreenIsLocked: false
                });
            } else if(!sounds[sound].isMusic && $rootScope.semi.sound) {
                sounds[sound].play();
            }
        }
        function stop(sound) {
            sounds[sound].stop();
        }

        function loadMedia(src, name, isMusic, onStop, onError, onStatus){
            if(isMusic === undefined) { isMusic = false; }
            var defer = $q.defer();

            $ionicPlatform.ready(function(){
                var mediaStatus = {
                    code: 0,
                    text: getStatusMessage(0)
                };
                var mediaSuccess = function(){
                    mediaStatus.code = 4;
                    mediaStatus.text = getStatusMessage(4);
                    if(onStop){onStop(); }
                };
                var mediaError = function(err){
                    _logError(src, err);
                    if(onError){onError(err);}
                };
                var mediaStatus = function(status){
                    mediaStatus.code = status;
                    mediaStatus.text = getStatusMessage(status);
                    if(onStatus){onStatus(status);}
                };

                if($ionicPlatform.is('android')){src = '/android_asset/www/' + src;}
                var media = new $window.Media(src, mediaSuccess, mediaError, mediaStatus);
                media.status = mediaStatus;
                media.name = name;
                media.isMusic = isMusic;
                function onStop(){
                    if(isMusic&&$rootScope.semi.music){ media.play(); }
                }
                defer.resolve(media);
            });
            return defer.promise;
        }

        function _logError(src, err){
            console.error('MediaSrv error', {
                code: err.code,
                text: getErrorMessage(err.code)
            });
        }


        function getStatusMessage(status){
            if(status === 0){return 'Media.MEDIA_NONE';}
            else if(status === 1){return 'Media.MEDIA_STARTING';}
            else if(status === 2){return 'Media.MEDIA_RUNNING';}
            else if(status === 3){return 'Media.MEDIA_PAUSED';}
            else if(status === 4){return 'Media.MEDIA_STOPPED';}
            else {return 'Unknown status <'+status+'>';}
        }

        function getErrorMessage(code){
            if(code === 1){return 'MediaError.MEDIA_ERR_ABORTED';}
            else if(code === 2){return 'MediaError.MEDIA_ERR_NETWORK';}
            else if(code === 3){return 'MediaError.MEDIA_ERR_DECODE';}
            else if(code === 4){return 'MediaError.MEDIA_ERR_NONE_SUPPORTED';}
            else {return 'Unknown code <'+code+'>';}
        }

        return service;
    })
    .factory('TestDefer', function($q, $timeout) {
        var fac = {};
        fac.test = function() {
            $timeout(function () {
                defer.resolve('this is Promise!');
            }, 1000);

            var defer = $q.defer();
            return defer.promise;
        };
        return fac
    })
;