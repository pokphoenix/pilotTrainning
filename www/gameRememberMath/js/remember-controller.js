angular.module('remmath.controllers')

    .controller('RemMathRemCtrl', function ($rootScope, $scope, $localStorage, $location, SemiSound, Semi, $timeout, $ionicModal) {
        // config

        //--- Timer
        $scope.timer = 120 ;
        $scope.timeForTimer = $scope.timer ;
        var mytimeout = null; // the current timeoutID

        function onTimeout() {
            if ($scope.timer === 0) {
                $scope.state = 'timesup';
                $scope.$broadcast('timer-stopped', 0);
                $timeout.cancel(mytimeout);
                return;
            }
            $scope.timer--;
            mytimeout = $timeout(onTimeout, 1000);
        };
        // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
        $scope.$on('timer-stopped', function(event, remaining) {
            if (remaining === 0) {
                $scope.done = true;
            }
        });
        // This function helps to display the time in a correct way in the center of the timer
        $scope.humanizeDurationTimer = function(input, units) {
            // units is a string with possible values of y, M, w, d, h, m, s, ms
            if (input == 0) {
                return 0;
            } else {
                var duration = moment().startOf('day').add(input, units);
                var format = "";
                if (duration.hour() > 0) {
                    format += "H[h] : ";
                }
                if (duration.minute() > 0) {
                    format += "m[m] : ";
                }
                if (duration.second() > 0) {
                    format += "s[s] ";
                }else{
                    format += "00[s] ";
                }
                return duration.format(format);
            }
        };





        var nextQtimer;
        $scope.state = 'wait';
        var maxQuestion = 25 ;  //---  set max question cannot repeat ;
        var repeatQuestion = 5 ;  //---  set max question repeat ;

        var timer;
        var questionElem = angularFind('#question');

        $scope = $scope || $rootScope.$new();
        $ionicModal.fromTemplateUrl(_path + _templatePause, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.pausePage = modal;
        });

        function randomString(length, chars) {
            var mask = '';
            if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
            if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (chars.indexOf('#') > -1) mask += '0123456789';
            if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
            var result = '';
            for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
            return result;
        }

        $rootScope.storeText = [] ;
        function shuffle(old_array) {
            var buffer_array = old_array.slice(), //clone the old_array
                length = buffer_array.length, //initial length
                new_array = [], //for storing new shuffled array
                i = 0, //for looping
                index; //for random index
            //looping starts
            for(i; i < length; i++) {
                //random index based on buffer_array length (dynamic length)
                index = Math.floor(Math.random() * buffer_array.length);
                //place the randomly picked element to new_array
                new_array.push(buffer_array[index]);
                //remove the picked element from buffer_array
                //the buffer_array length will be decreased by 1
                buffer_array.splice(index, 1);
            }
            return new_array; //output: new shuffled array
        }

        //--- set above  because use before genQuestion
        function genText() {
            var available = true ,genloop = true , placed = 0 ;
            //--- gen not repeat text
            while(genloop) {
                var text = randomString(3, '#A') ;
                for(var point in $rootScope.storeText) {
                    var oldText = $rootScope.storeText[point] ;
                    if(oldText==text){
                        available = false;
                        break;
                    }
                }
                if(available) {
                    $rootScope.storeText.push(text);
                    placed += 1;
                    if (placed == maxQuestion) {
                        genloop = false;
                        break;
                    }
                }
            }
            //--- repeat question
            var newArray =  shuffle($rootScope.storeText);
            var i = 0;
            //--- if first value from new array equal last old array
            if (newArray[0] == $rootScope.storeText[$rootScope.storeText.length]){
                i = 1;
                repeatQuestion ++ ;
            }
            for (i ; i < repeatQuestion ; i++ ){
                var text = newArray[i] ;
                $rootScope.storeText.push(text);
            }
        }
        
        genText();
        console.log('$rootScope.storeText',$rootScope.storeText);

        $scope.$watch(
            //function ( scope ) { return( $scope.state ); },
            'state',
            function (newVal, oldVal) {

                // console.log('*state', newVal);
                if ($scope.state == 'wait') {
                    $timeout(function () {
                        startTimer();
                        //$timeout.cancel(yourTimer);
                    }, 250);
                } else if ($scope.state == 'timesup') {
                    goToMath();
                }
            });

        //------------------------
        //-- on choose another app
        //------------------------
        function angularFind(query) {
            return angular.element(document.querySelector(query));
        }
        function startTimer() {
            mytimeout = $timeout(onTimeout, 1000);
        }
        function goToMath() {
            $timeout(function () {
                $location.path('/remmath/math');
            }, 1000);
            $scope.state = 'play' ;
        }

    })

;
