angular.module('remmath.controllers')

    .controller('RemMathPlayCtrl', function ($rootScope, $scope, $localStorage, $location, SemiSound, Semi, $timeout, $ionicModal) {
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




        $scope.inputAnswer = '' ;
        var nextQtimer;
        $scope.question = "";
        $scope.answer = 0;
        $rootScope.currentScore = 0;
        $scope.state = 'play';

        $rootScope.cntQuestion = 0;    //---  use for check question count

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




        console.log('$rootScope.storeText',$rootScope.storeText);

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
                } else if ($scope.state == 'correct') {
                    SemiSound.play('success');
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
                            }
                        }, 250);
                    }, 500);
                    // -- Next Qustion
                    checkComplete();
                } else if ($scope.state == 'wrong') {
                    semiAnimate('#wrong');
                    SemiSound.play('fail');
                    $scope.inputAnswer = '';
                    $timeout(function () {
                        questionElem.addClass('out');
                        $timeout(function () {
                            questionElem.removeClass('out');
                            if ($scope.state != 'pause') {
                                // -- for smoother transition
                                genQuestion();
                            }
                        }, 250);
                    }, 500);
                    checkComplete();
                } else if ($scope.state == 'timesup') {
                    goToMath();
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
            mytimeout = $timeout(onTimeout, 1000);
        }

        function nextQuestion() {
            $scope.inputAnswer = '';
            var waitTime = 750;
            nextQtimer = $timeout(function () {
                //SemiSound.play('next');
                $scope.state = 'play';
            }, waitTime);
        }

        function goToMath() {
            $timeout(function () {
                $location.path('/remmath/math');
            }, 1000);
            $scope.state = 'play' ;
        }

        function gameOver() {
            $scope.answerAction = "wrong";
            $timeout(function () {
                $location.path('/remmath/game-over');
            }, 1000);
            $scope.state = 'wait' ;
        }

        function gameComplete() {
            $timeout(function () {
                $location.path('/remmath/game-over');
            }, 1000);
            $scope.state = 'wait' ;
        }

        function checkComplete() {
            console.log('Score ',$rootScope.currentScore+' / '+$rootScope.cntQuestion);
            if ($rootScope.cntQuestion == maxQuestion) {
                gameComplete();
            }else{
                nextQuestion();
            }
        }



        $scope.draggableObjects = [
        ];


        for (var i=1 ; i<=30 ; i++  ){
            $scope.draggableObjects.push('it'+i);
        }


        $scope.droppedObjects = [];

        $scope.onDropComplete=function(index,data){
            $scope.droppedObjects[index]=data;
        }




        $scope.droppedObjects1 = [];
        $scope.droppedObjects2= [];
        $scope.onDropComplete1=function(data,evt){
            var index = $scope.droppedObjects1.indexOf(data);
            if (index == -1)
                $scope.droppedObjects1.push(data);
        }
        $scope.onDragSuccess1=function(data,evt){
            console.log("133","$scope","onDragSuccess1", "", evt);
            var index = $scope.droppedObjects1.indexOf(data);
            if (index > -1) {
                $scope.droppedObjects1.splice(index, 1);
            }
        }
        $scope.onDragSuccess2=function(data,evt){
            var index = $scope.droppedObjects2.indexOf(data);
            if (index > -1) {
                $scope.droppedObjects2.splice(index, 1);
            }
        }
        $scope.onDropComplete2=function(data,evt){
            var index = $scope.droppedObjects2.indexOf(data);
            if (index == -1) {
                $scope.droppedObjects2.push(data);
            }
        }

        $scope.onDragSuccess=function(data,evt){
            console.log("133","$scope","onDragSuccess", "", evt);
            var index = $scope.draggableObjects.indexOf(data);
            if (index > -1) {
                $scope.draggableObjects.splice(index, 1);
            }
        }

        $scope.droppedObjects = [] ;
        $scope.onDropComplete=function(index,data,evt){
            console.log('onDropComplete');
            $scope.droppedObjects[index] = data ;
        }
        $scope.onDragOutSuccess=function(index,data,evt){
            console.log('onDragOutSuccess');
            $scope.droppedObjects[index] = '' ;
        }
        
        
        var inArray = function(array, obj) {
            var index = array.indexOf(obj);
        }

console.log($scope.droppedObjects[1]);

        $scope.$on("drag-ready", function(e,d) { console.log("Drag ready", e,d); });
        return $scope.logThis = function(message, draggable, droppable) {
            return console.log(message, {
                'draggable': draggable,
                'droppable': droppable
            });
        };



        $scope.dropped = function(dragEl, dropEl) { // function referenced by the drop target
            //this is application logic, for the demo we just want to color the grid squares
            //the directive provides a native dom object, wrap with jqlite
            var drop = angular.element(dropEl);
            var drag = angular.element(dragEl);

            //clear the previously applied color, if it exists
            var bgClass = drop.attr('data-color');
            if (bgClass) {
                drop.removeClass(bgClass);
            }

            //add the dragged color
            bgClass = drag.attr("data-color");
            drop.addClass(bgClass);
            drop.attr('data-color', bgClass);

            //if element has been dragged from the grid, clear dragged color
            if (drag.attr("x-lvl-drop-target")) {
                drag.removeClass(bgClass);
            }
        }


        /* The dragging code for '.draggable' from the demo above
         * applies to this demo as well so it doesn't have to be repeated. */

// enable draggables to be dropped into this
        interact('.dropzone').dropzone({
            // only accept elements matching this CSS selector
            accept: '#yes-drop',
            // Require a 75% element overlap for a drop to be possible
            overlap: 0.75,

            // listen for drop related events:

            ondropactivate: function (event) {
                // add active dropzone feedback
                event.target.classList.add('drop-active');
            },
            ondragenter: function (event) {
                var draggableElement = event.relatedTarget,
                    dropzoneElement = event.target;

                // feedback the possibility of a drop
                dropzoneElement.classList.add('drop-target');
                draggableElement.classList.add('can-drop');
                draggableElement.textContent = 'Dragged in';
            },
            ondragleave: function (event) {
                // remove the drop feedback style
                event.target.classList.remove('drop-target');
                event.relatedTarget.classList.remove('can-drop');
                event.relatedTarget.textContent = 'Dragged out';
            },
            ondrop: function (event) {
                event.relatedTarget.textContent = 'Dropped';
            },
            ondropdeactivate: function (event) {
                // remove active dropzone feedback
                event.target.classList.remove('drop-active');
                event.target.classList.remove('drop-target');
            }
        });




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


        var draggableData = [
            {
                fruitname: "apple",
                fruitimg: "apple.png"
            }, {
                fruitname: "banana",
                fruitimg: "banana.png"
            }, {
                fruitname: "cherry",
                fruitimg: "cherry.png"
            }, {
                fruitname: "greenapple",
                fruitimg: "greenapple.png"
            }, {
                fruitname: "kiwi",
                fruitimg: "kiwi.png"
            }, {
                fruitname: "peach",
                fruitimg: "peach.png"
            }, {
                fruitname: "strawberry",
                fruitimg: "strawberry.png"
            }, {
                fruitname: "watermelon",
                fruitimg: "watermelon.png"
            }
        ];

        var droppableData = [
            {
                fruitname: "apple",
                fruitimg: "apple_callout.png"
            }, {
                fruitname: "banana",
                fruitimg: "banana_callout.png"
            }, {
                fruitname: "cherry",
                fruitimg: "cherry_callout.png"
            }, {
                fruitname: "greenapple",
                fruitimg: "greenapple_callout.png"
            }, {
                fruitname: "kiwi",
                fruitimg: "kiwi_callout.png"
            }, {
                fruitname: "peach",
                fruitimg: "peach_callout.png"
            }, {
                fruitname: "strawberry",
                fruitimg: "strawberry_callout.png"
            }, {
                fruitname: "watermelon",
                fruitimg: "watermelon_callout.png"
            }
        ];

        $scope.draggableArray = draggableData;
        $scope.droppableArray = droppableData;

        //shuffle the array for randomness
        $scope.draggableArray = shuffle($scope.draggableArray);
        $scope.droppableArray = shuffle($scope.droppableArray);

        $scope.draggableArrayLength = $scope.draggableArray.length;

        $scope.doraemonStatus = "sleeping";
        $scope.setDoraemonStatus = function (value) {
            $scope.$apply(function () {
                $scope.doraemonStatus = value;
            })
        }

        $scope.score = 0;
        $scope.setScore = function (value) {
            $scope.$apply(function () {
                $scope.score = $scope.score + value;
            });
        };

        $scope.$watch(function () {
            return $scope.score;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                console.log("array length", $scope.draggableArrayLength, "score", newVal)
                if (newVal == $scope.draggableArrayLength) {
                    console.log("game over");
                    $timeout(function(){
                        $scope.setDoraemonStatus("finish")
                    },2000)
                }
            }
        });

        $scope.removeFromArray = function (value) {
            console.log(value);
            angular.forEach($scope.draggableArray, function (arrvalue, arrindex) {
                var fruitname = arrvalue.fruitname;
                if (fruitname == value) {
                    $scope.matchedIndex = arrindex;
                }
            });
            $scope.$apply(function () {
                $scope.draggableArray.splice($scope.matchedIndex, 1);
            })
        }



    })
    .directive("dragme", ["$timeout", function ($timeout) {
        return {
            restrict: "A",
            replace: true,
            scope: {
                myindex: "=",
                setDoraemon: "&"
            },
            link: function ($scope, $elem, $attr) {
                var backgroundImage = $attr.backgroundimage;
                var answerData = $attr.answerdata;
                var myBgcolor = $attr.bgcolor;
                var myLeft = parseInt($attr.left);

                $elem.addClass("draggable");
                $elem.attr("data-answerimage", backgroundImage);
                $elem.attr("data-answerdata", answerData);
                $elem.attr("data-myindex", $scope.myindex);

                $elem.css({
                    left: myLeft,
                    backgroundImage: "url(img/" + backgroundImage + ")"
                });

                $elem.draggable({
                    helper: "clone",
                    revert: true,
                    appendTo: "body",
                    zIndex: 100,
                    drag: function (event, ui) {
                        $(ui.helper).css("border", "0px");
                        $scope.setDoraemon({
                            value: "dragging"
                        })
                    }
                })

            }
        }
    }])
    .directive("dropme", ["$timeout", function ($timeout) {
        return {
            restrict: "A",
            replace: true,
            scope: {
                setScore: "&",
                removeArray: "&",
                setDoraemon: "&"
            },
            link: function ($scope, $elem, $attr) {
                var backgroundImage = $attr.backgroundimage;
                var answerData = $attr.fruitname;

                $elem.addClass("droppable");
                $elem.attr("data-answerimage", backgroundImage);
                $elem.attr("data-answerdata", answerData);
                $elem.css({
                    backgroundImage: "url(img/" + backgroundImage + ")"
                });
                $elem.droppable({
                    accept: ".draggable",
                    drop: function (event, ui) {
                        var droppedElem = ui.draggable;
                        var myAnswer = $(this).attr("data-answerdata");
                        if ($(droppedElem).attr("data-answerdata") == myAnswer) { //if both match
                            $(this).css("background-image", "url(img/" + droppedElem.attr("backgroundimage") + ")");
                            $(this).attr("data-isanswered", "yes");
                            $scope.setScore({
                                value: 1
                            });
                            $scope.removeArray({
                                value: $(droppedElem).attr("data-answerdata")
                            });
                            $scope.setDoraemon({
                                value: "happy"
                            })
                        } else {
                            $(this).effect("shake");
                            $scope.setDoraemon({
                                value: "tease"
                            })
                        }

                    }
                })
            }
        }
    }])

;
