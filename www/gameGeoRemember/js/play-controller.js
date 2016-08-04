angular.module('georemember.controllers')

    .controller('GeoRememberPlayCtrl', function ($rootScope, $scope, $localStorage, $location, SemiSound, Semi, $timeout, $filter) {
        // config
        // mode init
        var mode = $rootScope.semi.mode;
        if(!mode) mode = 'easy';
        $scope.timer = 360 ;
        $scope.timeForTimer = $scope.timer ;
        if(mode == 'normal') {
        } else if(mode == 'hard') {
        }

        var mytimeout = null; // the current timeoutID

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
        $scope.question = "";
        $scope.answer = '';
        $rootScope.currentScore = 0;
        $rootScope.cntQuestion = 0;    //---  use for check question count
        $scope.state = 'wait';
        $scope.data = [];
        $scope.data.answer='' ;         //--- set default form input val
        $scope.storeQuestion = [] ;

        var nextQtimer,
            maxQuestion = 20 ,  //---  set max question
            timer,
            questionElem = angularFind('#question');
        
        $scope.submitAnswer = function (form) {
            if(form.$valid) {
                if ($scope.state == 'play' || $scope.state == 'wait') { // prevent click
                    $scope.inputAnswer = $filter('uppercase')(this.data.answer);
                    if ($scope.inputAnswer == $scope.answer) {
                        $scope.state = 'correct';
                    } else {
                        $scope.state = 'wrong';
                    }
                    $rootScope.cntQuestion++;
                    this.data.answer = '' ;  //--- clear input  answer  val
                }
            }
        };

        $scope.$watch(
            //function ( scope ) { return( $scope.state ); },
            'state',
            function (newVal, oldVal) {

                // console.log('*state', newVal);
                if ($scope.state == 'wait') {
                    semiAnimate('#animate-score-action');
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
                    gameOver();
                }
            });


        //------------------------
        //-- on choose another app
        //------------------------

        function angularFind(query) {
            return angular.element(document.querySelector(query));
        }

        function semiAnimate(query) {
            angular.element(document.querySelector(query)).addClass('semi-anim');
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

        function gameOver() {
            $scope.answerAction = "wrong";
            $timeout(function () {
                $location.path('/georemember/game-over');
            }, 1000);
            $scope.state == 'wait' ;
        }

        function gameComplete() {
            $timeout(function () {
                $location.path('/georemember/game-over');
            }, 1000);
            $scope.state == 'wait' ;
        }

        function checkComplete() {
            console.log('Score ',$rootScope.currentScore+' / '+$rootScope.cntQuestion);
            if ($rootScope.cntQuestion == maxQuestion) {
                gameComplete();
            }else{
                nextQuestion();
            }
        }

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

        function drawSquare(ctx, x, y, radius,color,text){
            ctx.save();

            // B1. DRAW POLYGON
            ctx.beginPath();
            ctx.rect(x, y, radius, radius);
            // B2. SET STYLE
            ctx.fillStyle = color ;
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
            // B3. ADD TEXT
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, x+(radius/2) ,y+(radius/2));
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }


        function regularpolygon(ctx, x, y, radius, sides, color,text) {
            if (sides < 3) return;

            ctx.save();

            // B1. DRAW POLYGON
            ctx.beginPath();
            var deg = Semi.randomInt(0,360) ;
            // rotate the rect
            // ctx.rotate(deg*Math.PI/180);
            ctx.moveTo (x +  radius * Math.cos(0), y +  radius *  Math.sin(0));
            for (var i = 1; i <= sides;i += 1) {
                ctx.lineTo (x + radius * Math.cos(i * 2 * Math.PI / sides), y + radius * Math.sin(i * 2 * Math.PI / sides));
            }
            // B2. SET STYLE
            ctx.fillStyle = color ;
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = 'black' ;
            ctx.closePath();
            // B3. ADD TEXT
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var width = ctx.measureText(text).width;
            var height = ctx.measureText("w").width; // this is a GUESS of height
            ctx.fillText(text, x ,y);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }

        function drawCircle(ctx, x, y, radius, color,text)
        {
            ctx.save();

            //B1. PARAMETERS for shadow and angles.
            var startAngle        = 0;
            var endAngle          = Math.PI*2;

            // B2. DRAW CIRCLE
            ctx.beginPath();
            ctx.arc(x, y, radius,
                    startAngle, endAngle, false);
            // fill color
            ctx.fillStyle = color;
            ctx.fill();
            // Give a stroke (width: 4 pixels).
            ctx.strokeStyle = 'black';
            ctx.lineWidth   = 2;
            ctx.stroke();
            ctx.closePath();

            // B3. ADD TEXT
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.font = "20px Arial";
            // ctx.lineWidth = 10;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text,x,y);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }

        function genPattern(){
                var canvas  = document.getElementById("canvasArea");

                var numCircles = 20;
                var maxRadius  = 60;
                var minRadius  = 40;
                // var colors     = ["aqua",  "black", "blue",  "fuchsia",
                //     "green", "cyan",  "lime",  "maroon",
                //     "navy",  "olive", "purple","red",
                //     "silver","teal",  "yellow","azure",
                //     "gold",  "bisque","pink",  "orange"];
                var colors = ["cyan"];

                var  platforms = [] ;




            var context = canvas.getContext("2d");
            var numColors  =  colors.length;
            var placed = 0,
                maxAttempts = numCircles,
                genloop = true ;

            var loop = 1 ;
            while(genloop) {
                var x = Math.floor(Math.random()*canvas.width),
                    y = Math.floor(Math.random()*canvas.height),
                    radius = minRadius+Math.floor(Math.random()*(maxRadius-minRadius)),
                    available = true,
                    colorIndex =  Math.random()*(numColors-1);
                colorIndex     =  Math.round(colorIndex);
                var color      =  colors[colorIndex];


                var text = ''+Semi.randomInt(1,50)+''+randomString(1, 'A') ;
                // context.font = "1rem Arial";
                // var textWidth = context.measureText(text).width;
                var textWidth = 50 ;
                // console.log('textWidth',textWidth);
                for(var point in platforms) {

                        var circle = platforms[point] ;
                        var dx=x-circle.x;
                        var dy=y-circle.y;
                        // var rr=radius+circle.size;
                        var rr=radius+textWidth;
                        var distanceRadius = rr*rr ;
                        // console.log(loop,(dx*dx)+'+'+(dy*dy)+'<'+(rr*rr));
                        if(((dx*dx)+(dy*dy)<(rr*rr)) ){
                            // if(((dx*dx)+(dy*dy)<(rr*rr)) ){
                            available = false;
                            break;
                        }


                    loop++ ;
                    // if((x+distanceRadius) < ele.x && (ele.y+distanceRadius) < y && (x-distanceRadius > 0)  && (x+distanceRadius < canvas.width) ) {
                    //     available = false;
                    //     break;
                    // }
                }

                // console.log(loop, x+'-'+radius+'>0',(x-radius) > 0,x+'+'+radius +'<'+canvas.width,(x + radius) < canvas.width,y+'-'+radius+'>0',(y-radius) > 0,y+'+'+radius+'<'+canvas.height,(y+radius) < canvas.height);

                // check not render out of border
                if( !((x-(textWidth/2)) > 0) || !((x + textWidth/2) < canvas.width)  || !(y-textWidth/2 > 0) || !(y+textWidth/2 < canvas.height)  ){
                    available = false;
                }

                if(available) {



                    console.log( x, y, radius,text);
                    var drawType = Semi.randomInt(0,5) ;
                    var angle = 0 ;
                    if (drawType==0){
                        drawCircle(context, x, y, radius, color,text);
                    }else{
                        angle = Semi.randomInt(3,6) ;
                        if (angle==4){
                            drawSquare(context, x, y, radius,color,text)
                        }else{
                            regularpolygon(context, x, y, radius, angle, color,text);
                        }
                    }


                    // store question
                    platforms.push({
                        angle:angle,
                        x: x,
                        y: y,
                        size:radius,
                        color:color,
                        text:text
                    });
                    placed += 1;

                    if (placed == maxAttempts) {
                        genloop = false;
                        break;
                    }
                }
            }

            $scope.storeQuestion = platforms ;

        }

        genPattern();



        function genQuestion() {
            // Brute Force Random-please optimize this in the future
            console.log($scope.storeQuestion);
            var questionArray = $scope.storeQuestion[$rootScope.cntQuestion] ;
            var question = questionArray.text.slice(0, -1);
            var ans = questionArray.text.substr(questionArray.text.length - 1) ;
            //
            var angle = questionArray.angle;
            console.log('question : '+angle+','+question+' answer : '+ans);
            $scope.angle = angle ;
            $scope.question = question;
            $scope.answer = ans;
        }


        genQuestion();




    })

;
