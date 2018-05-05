
let app = angular.module('myApp', [
    'ngRoute','rzModule',
    'mobile-angular-ui',
    'ngCookies',/*'ngMaterial',*/
    'ngSanitize','LocalStorageModule','ui.bootstrap.modal',
    'ngFileUpload','mobile-angular-ui.gestures'
]);

/*app.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://192.168.1.15/**']);
});*/
app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

app.controller('mainController', ['AuthenticationService','messagesService','$http', '$location', '$window','$rootScope','$scope','programService', function (AuthenticationService,messagesService,$http,$location, $window,$rootScope,$scope,programService) {
    let self = this;
    self.messageService = messagesService;
    self.authService = AuthenticationService;
    //$window.alert("username: "+ self.authService.userId );
    self.logout = function()
    {
        AuthenticationService.ClearCredentials();
        $window.alert("loggedOut");

    }
    self.click = function()
    {
        //alert("click");
        $location.path('/messages');

    }
    self.isPatient = function()
    {
        if(AuthenticationService.isPhysio == true || AuthenticationService.isAdmin== true ||AuthenticationService.userId== "guest"   ||AuthenticationService.userId =="אורח")
        {
            return false;
        }
        else {
            return true;
        }
    }

    // Needed for the loading screen
    $rootScope.$on('$routeChangeStart', function() {
        $rootScope.loading = true;
    });

    $rootScope.$on('$routeChangeSuccess', function() {
        $rootScope.loading = false;
    });


    //self.userName = "noa";
  /*  let ip = "192.168.1.15";
    let port = 4001;
    let testURL = "2017-12-08 03:04:44.000";
    //self.videoURL = "http:192.168.1.15:4001/api/video/2017-12-08 03:04:44.000";
    self.videoURL = "http://" + ip + ":" + port + "/api/video/" + testURL;
    console.log("videoURL"+self.videoURL);
    let req2 = "http://192.168.1.15:4001/api/GetAllVideosPathes";
    //let req = {
        // method: 'GET',
        //url: "http://" + ip + ":" + port + "/api/GetAllVideosPathes",
       // headers: {
        //    'Content-Type': "application/json"
       // },
       // data: {
        //    "username": userid,
        //    "password": pass
       // }
    //};
    $http.get(req2).then(function (ans) {
        self.videos = ans.data;
        self.videosURL = [];
        for (i = 0; i < self.videos.length; i++) {
            self.videosURL.push("http://" + ip + ":" + port + "/api/video/"+self.videos[i].id);
        }
        console.log(self.videosURL);

        //console.log(self.videsPathes);
        });

    //console.log(self.videosPathes);
    let req3 = "http://" + ip + ":" + port + "/api/testUsers";
    $http.get(req3).then(function (ans) {
        self.userName = ans.data[0].username;

        //console.log(self.videsPathes);
    });
    self.changeVideo = function (user) {
        self.videoURL = "http://" + ip + ":" + port + "/api/video/2017-12-20 10:15:37.000";
      // self.videoURL = "http://192.168.1.15:4001/api/video/2017-12-20 10:15:37.000";
    };*/
}]);

app.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) { ////new change for reset password
            // redirect to login page if not logged in
            if (($location.path() !== '/resetPassword' )&& !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }]);

//adding
app.run(function($transform) {
    window.$transform = $transform;
});

app.directive('file', function () {
    return {
        scope: {
            file: '='
        },
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var file = event.target.files[0];
                scope.file = file ? file : undefined;
                scope.$apply();
            });
        }
    };
});

///new


app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",reloadOnSearch: false,
            controller : "mainController",
        }).when("/exercises", {
        templateUrl : "views/exercises.html",reloadOnSearch: false,
        controller : "exerciseController"
    }).when("/programs", {
    templateUrl : "views/programs.html",reloadOnSearch: false,
    controller : "programsController"
}).when("/patients", {
        templateUrl : "views/patients.html",reloadOnSearch: false,
        controller : "patientsController"
    }).when("/newProgram", {
        templateUrl : "views/newProgram.html",reloadOnSearch: false,
        controller : "newProgController"
}).when('/login', {
        controller: 'LoginController',reloadOnSearch: false,
        templateUrl: 'views/login.html'
    })
        .when('/register', {
            controller: 'RegisterController',reloadOnSearch: false,
            templateUrl: 'views/register.html'
        }).when('/addToBank', {
        controller: 'bankController',reloadOnSearch: false,
        templateUrl: 'views/addToBank.html'
    }).when('/patFeedback', {
        controller: 'patFeedbackController',reloadOnSearch: false,
        templateUrl: 'views/patFeedback.html'
    }).when('/resetPassword', {
        controller: 'resetPasswordController',reloadOnSearch: false,
        templateUrl: 'views/resetPass.html'
    }).when('/updatePassword', {
        controller: 'updatePasswordController',reloadOnSearch: false,
        templateUrl: 'views/updatePass.html'
    }).when('/messages', {
        controller: 'messagesController',reloadOnSearch: false,
        templateUrl: 'views/messages.html'
    }).when('/changeDetails', {
        controller: 'changeDetailsController',reloadOnSearch: false,
        templateUrl: 'views/changeDetails.html'
    }).when('/changeUserPass', {
        controller: 'changeUserPassController',reloadOnSearch: false,
        templateUrl: 'views/changeUserPass.html'
    })
        .otherwise({redirect: '/',
        });
}]);


////New

// `$touch example`
//

app.directive('toucharea', ['$touch', function($touch) {
    // Runs during compile
    return {
        restrict: 'C',
        link: function($scope, elem) {
            $scope.touch = null;
            $touch.bind(elem, {
                start: function(touch) {
                    $scope.containerRect = elem[0].getBoundingClientRect();
                    $scope.touch = touch;
                    $scope.$apply();
                },

                cancel: function(touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                move: function(touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                end: function(touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                }
            });
        }
    };
}]);

//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function($drag, $parse, $timeout) {
    return {
        restrict: 'A',
        compile: function(elem, attrs) {
            var dismissFn = $parse(attrs.dragToDismiss);
            return function(scope, elem) {
                var dismiss = false;

                $drag.bind(elem, {
                    transform: $drag.TRANSLATE_RIGHT,
                    move: function(drag) {
                        if (drag.distanceX >= drag.rect.width / 4) {
                            dismiss = true;
                            elem.addClass('dismiss');
                        } else {
                            dismiss = false;
                            elem.removeClass('dismiss');
                        }
                    },
                    cancel: function() {
                        elem.removeClass('dismiss');
                    },
                    end: function(drag) {
                        if (dismiss) {
                            elem.addClass('dismitted');
                            $timeout(function() {
                                scope.$apply(function() {
                                    dismissFn(scope);
                                });
                            }, 300);
                        } else {
                            drag.reset();
                        }
                    }
                });
            };
        }
    };
});

//
// Another `$drag` usage example: this is how you could create
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function() {
    return {
        restrict: 'C',
        scope: {},
        controller: function() {
            this.itemCount = 0;
            this.activeItem = null;

            this.addItem = function() {
                var newId = this.itemCount++;
                this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
                return newId;
            };

            this.next = function() {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
            };

            this.prev = function() {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
            };
        }
    };
});

app.directive('carouselItem', function($drag) {
    return {
        restrict: 'C',
        require: '^carousel',
        scope: {},
        transclude: true,
        template: '<div class="item"><div ng-transclude></div></div>',
        link: function(scope, elem, attrs, carousel) {
            scope.carousel = carousel;
            var id = carousel.addItem();

            var zIndex = function() {
                var res = 0;
                if (id === carousel.activeItem) {
                    res = 2000;
                } else if (carousel.activeItem < id) {
                    res = 2000 - (id - carousel.activeItem);
                } else {
                    res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
                }
                return res;
            };

            scope.$watch(function() {
                return carousel.activeItem;
            }, function() {
                elem[0].style.zIndex = zIndex();
            });

            $drag.bind(elem, {
                //
                // This is an example of custom transform function
                //
                transform: function(element, transform, touch) {
                    //
                    // use translate both as basis for the new transform:
                    //
                    var t = $drag.TRANSLATE_BOTH(element, transform, touch);

                    //
                    // Add rotation:
                    //
                    var Dx = touch.distanceX;
                    var t0 = touch.startTransform;
                    var sign = Dx < 0 ? -1 : 1;
                    var angle = sign * Math.min((Math.abs(Dx) / 700) * 30, 30);

                    t.rotateZ = angle + (Math.round(t0.rotateZ));

                    return t;
                },
                move: function(drag) {
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        elem.addClass('dismiss');
                    } else {
                        elem.removeClass('dismiss');
                    }
                },
                cancel: function() {
                    elem.removeClass('dismiss');
                },
                end: function(drag) {
                    elem.removeClass('dismiss');
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        scope.$apply(function() {
                            carousel.next();
                        });
                    }
                    drag.reset();
                }
            });
        }
    };
});

app.directive('dragMe', ['$drag', function($drag) {
    return {
        controller: function($scope, $element) {
            $drag.bind($element,
                {
                    //
                    // Here you can see how to limit movement
                    // to an element
                    //
                    transform: $drag.TRANSLATE_INSIDE($element.parent()),
                    end: function(drag) {
                        // go back to initial position
                        drag.reset();
                    }
                },
                { // release touch when movement is outside bounduaries
                    sensitiveArea: $element.parent()
                }
            );
        }
    };
}]);

