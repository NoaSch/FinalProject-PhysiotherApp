
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

app.controller('mainController', ['ipconfigService','AuthenticationService','messagesService','$http', '$location', '$window','$rootScope','$scope','programService','$timeout', function (ipconfigService,AuthenticationService,messagesService,$http,$location, $window,$rootScope,$scope,programService,$timeout) {
    let self = this;
    self.messageService = messagesService;
    self.authService = AuthenticationService;
    //let mail  = "noasch4@gmail.com";
    //let sig = "0831a3d8b0255609a35f8e8fe358d3c2400bccd6";
    if(self.authService.loggedIn) {
        let reqForSig = {
            method: 'POST',
            url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/getDetForNoticfication',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "username": self.authService.userId,
                "isPhysio": self.authService.isPhysio
            }
        };
        $http(reqForSig).then(function (res) {
            if (res.data.hasOwnProperty('error_code')) {
                alert("שגיאה");
            }
            else {
                let mail = res.data[0].mail;
                let sig = res.data[0].sig;
                self.url = "https://pushpad.xyz/projects/5527/subscription/edit?uid=" + mail + "&uid_signature=" + sig;
            }
        }).catch(function (err) {
            alert("שגיאה");
        });
    }

    //alert (self.url);


    /*self.subscribe = function()
    {
        pushpadpushpad('subscribe', function () {}, {
            tags: ['t1', 't2'], // add tags 't1' and 't2'
            uid: '33', // keep track of the current user ID
            uidSignature: '4b9503324d1c97ecfc551dbb377452c85da8ebb9'
        });
    }*/


    var loadTime = 1000, //Load the data every second
        errorCount = 0, //Counter for the server errors
        loadPromise; //Pointer to the promise created by the Angular $timout service
    var getData = function() {
        let req = {
            method: 'POST',
            url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/getNumNewMessages',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "username": self.authService.userId,
            }
        };
        $http(req).then(function (res) {
            //messagesService.setNumNew(res.data[0]);
            self.numnew = res.data[0];
                //errorCount = 0;
                nextLoad();
            })

            .catch(function(res) {
                self.numnew = '0';
                nextLoad(++errorCount * 2 * loadTime);
            });
    };

    var cancelNextLoad = function() {
        $timeout.cancel(loadPromise);
    };

    var nextLoad = function(mill) {
        mill = mill || loadTime;

        //Always make sure the last timeout is cleared before starting a new one
        cancelNextLoad();
        loadPromise = $timeout(getData, mill);
    };


    //Start polling the data from the server
    //getData();


    //Always clear the timeout when the view is destroyed, otherwise it will keep polling
    $scope.$on('$destroy', function() {
        cancelNextLoad();
    });

    $scope.data = 'Loading...';

    //$window.alert("username: "+ self.authService.userId );
    self.logout = function()
    {
        AuthenticationService.ClearCredentials();
        $window.alert("loggedOut");

    }
    self.click = function()
    {
        if(self.isPatient()) {
            $location.path('/messages');
        }
        else {
            $location.path('/patients');
        }

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
    }).when('/addExeToProg', {
        controller: 'addExeToProgController',reloadOnSearch: false,
        templateUrl: 'views/addExeToProg.html'
    }).when('/editExe', {
        controller: 'editExeController',reloadOnSearch: false,
        templateUrl: 'views/editExe.html'
    })
        .otherwise({redirect: '/',
        });
}]);
//addExeToProgController

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

