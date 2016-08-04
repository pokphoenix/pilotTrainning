angular.module('math.controllers')

    .controller('MathPlayCtrl', function ($rootScope, $scope, $localStorage, $location, SemiSound, Semi, $timeout, $ionicModal) {


        // config
        // mode init
        var mode = $rootScope.semi.mode;
        if(!mode) mode = 'easy';
        $scope.timer = 5 ;
        $scope.timeForTimer = $scope.timer ;
        var cntPlus = 4; // easy
        var countMinus = 1;
        var timeIdx = 24;
        var maxQuestionNumber = 50 ;
        var signs = ['+','-'];
        var signNumber = 1 ;
        if(mode == 'normal') {
            $scope.timer = 4 ;
            $scope.timeForTimer = $scope.timer ;
            cntPlus = 2;
            timeIdx = 13;
            countMinus = 1;
            signs = ['+','-','*'];
            signNumber = 2 ;
        } else if(mode == 'hard') {
            $scope.timer = 3 ;
            $scope.timeForTimer = $scope.timer ;
            cntPlus = 1;
            timeIdx = 7;
            countMinus = 1;
            signs = ['+','-','*'];
            signNumber = 2 ;
        }


        var mytimeout = null; // the current timeoutID
        $scope.onTimeout = function() {
            $scope.timer--;
            // console.log('onTimeout',$scope.timer);
            if ($scope.timer === 0) {
                console.log('$scope.timer === 0');
                $scope.state = 'timesup';
                $scope.$broadcast('timer-stopped', 0);
                $timeout.cancel(mytimeout);
                return;
            }
            mytimeout = $timeout($scope.onTimeout, 1000);
        };

        // pauses the timer
        $scope.pauseTimer = function() {
            $scope.$broadcast('timer-stopped', $scope.timer);
            $scope.started = false;
            $scope.paused = true;
            $timeout.cancel(mytimeout);
        };

        // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
        $scope.$on('timer-stopped', function(event, remaining) {
            if (remaining === 0) {
                $scope.done = true;
            }
        });
        // UI


        // This function helps to display the time in a correct way in the center of the timer
        $scope.humanizeDurationTimer = function(input, units) {
            // units is a string with possible values of y, M, w, d, h, m, s, ms
            if (input == 0) {
                return 0;
            } else {
                var duration = moment().startOf('day').add(input, units);
                var format = "";
                if (duration.hour() > 0) {
                    format += "H[h] ";
                }
                if (duration.minute() > 0) {
                    format += "m[m] ";
                }
                if (duration.second() > 0) {
                    format += "s[s] ";
                }
                return duration.format(format);
            }
        };


        $scope.inputAnswer = '' ;

       
        var oldQuestion = '';

        var nextQtimer;

        $scope.question = "";
        $scope.answer = 0;
        $rootScope.currentScore = 0;
        $scope.state = 'wait';
        $rootScope.cntQuestion = 0;    //---  use for check question count

        var timer;
        var questionElem = angularFind('#question');

        $scope = $scope || $rootScope.$new();
        $ionicModal.fromTemplateUrl(_path + _templatePause, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.pausePage = modal;
        });

        $scope.openPause = function () {
            $scope.pausePage.show();
            if($location.path() == '/math/play') {
                $scope.state = 'pause';
            }
        };
        $scope.closePause = function () {
            genQuestion();
            $scope.pausePage.hide();
            if ($scope.currentScore == 0) {
                $scope.state = 'wait';
            } else {
                $scope.state = 'play';
            }
        };

        $scope.selectAnswer = function (aid) {
            if (aid=='x'){
                $scope.inputAnswer = $scope.inputAnswer.slice(0, -1);
            }else if (aid=='-') {
                $scope.inputAnswer = '-';
            }else{
                $scope.inputAnswer = $scope.inputAnswer+''+aid ;
            }
        };

        $scope.submitAnswer = function () {
            if ($scope.state == 'play' || $scope.state == 'wait') { // prevent click
                $scope.aid = $scope.inputAnswer;
                if ($scope.inputAnswer == $scope.answer) {
                    $scope.state = 'correct';
                } else {
                    $scope.state = 'wrong';
                }
                $rootScope.cntQuestion++;
            }
        };

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
                } else if ($scope.state == 'play') {
                    $timeout(function () {
                        startTimer();
                        //$timeout.cancel(yourTimer);
                    }, 250);
                } else if ($scope.state == 'correct') {
                    SemiSound.play('success');
                    stopTimer();
                    // -- Add Score
                    $rootScope.currentScore++;
                    // -- Animate Question Slide Out
                    $timeout(function () {
                        questionElem.addClass('out');
                        $timeout(function () {
                            questionElem.removeClass('out');
                            if ($scope.state != 'pause') {
                                // -- for smoother transition
                                genQuestion();
                                startTimer();
                                stopTimer();
                            }
                        }, 250);
                    }, 500);
                    // -- Next Qustion
                    nextQuestion();
                } else if ($scope.state == 'wrong') {
                    semiAnimate('#wrong');
                    stopTimer();
                    gameOver();
                } else if ($scope.state == 'timesup') {
                    $rootScope.cntQuestion++;
                    gameOver();
                } else if ($scope.state == 'pause') {
                    stopTimer();
                    $timeout.cancel(nextQtimer);
                }
            });


        //------------------------
        //-- on choose another app
        //------------------------
        document.addEventListener("pause", onPause, false);

        function onPause() {
            if($scope.state != 'timesup' && $scope.state != 'wait') {
                $timeout.cancel(nextQtimer);
                $scope.openPause();
            }
        }

        function angularFind(query) {
            return angular.element(document.querySelector(query));
        }

        function semiAnimate(query) {
            angular.element(document.querySelector(query)).addClass('semi-anim');
        }

        function stopTimer() {
            $scope.$broadcast('timer-stopped', $scope.timer);
            $scope.timer = $scope.timeForTimer;
            $timeout.cancel(mytimeout);
        }

        function startTimer() {
            // console.log('startTimer',answerTime);
            mytimeout = $timeout($scope.onTimeout, 1000);

            // mytimeout = $timeout(function () {
            //     $scope.state = 'timesup';
            // }, (answerTime * 1000) + 100); // fix timeout

        }

        function nextQuestion() {
            $scope.inputAnswer = '';
            var waitTime = 750;
            nextQtimer = $timeout(function () {
                //SemiSound.play('next');
                $scope.state = 'play';
            }, waitTime);
        }

        function gameOver() {
            $scope.answerAction = "wrong";
            $timeout(function () {
                $location.path('/math/game-over');
            }, 1000);
            $scope.state == 'wait' ;
        }

        function genQuestion() {
            // Brute Force Random-please optimize this in the future
            var cntNumber = Semi.randomInt(0, maxQuestionNumber);
            var ans = 0;
            var question = '';
            // var signs = ['+', '-','*'];
            do {
                ans = cntNumber;
                question = cntNumber;
                var num = Semi.randomInt(0, maxQuestionNumber);
                var sign = signs[Semi.randomInt(signNumber)];
                question += ' ' + sign + ' ' + num;
                if(sign == '+') ans += num;
                else if(sign == '-') ans -= num;
                else ans *= num;
            } while(oldQuestion == question); // fix : no same question
            oldQuestion = question;
            console.log('question : '+question+' answer : '+ans);
            $scope.question = question;
            $scope.answer = ans;
        }


        genQuestion();



    })

;
