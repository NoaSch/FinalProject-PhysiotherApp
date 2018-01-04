let app = angular.module('myApp', [
    'ngRoute',
    'mobile-angular-ui',
    'ngCookies',
    'ngSanitize','LocalStorageModule','ui.bootstrap.modal',
    'ngFileUpload'
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

app.controller('mainController', ['AuthenticationService','$http', '$location', '$window','$rootScope','$scope','programService', function (AuthenticationService,$http,$location, $window,$rootScope,$scope,programService) {
    let self = this;

    self.authService = AuthenticationService;


    console.log("noa");
    console.log("username: "+ self.authService.userId );



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

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }]);

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
app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",
            controller : "mainController"
        }).when("/exercises", {
        templateUrl : "views/exercises.html",
        controller : "exerciseController"
    }).when("/programs", {
    templateUrl : "views/programs.html",
    controller : "programsController"
}).when("/patients", {
        templateUrl : "views/patients.html",
        controller : "patientsController"
    }).when("/newProgram", {
        templateUrl : "views/newProgram.html",
        controller : "newProgController"
    }).when('/login', {
        controller: 'LoginController',
        templateUrl: 'views/login.html'
    })
        .otherwise({redirect: '/',
        });
}]);
/*let app = angular.module('myApp', ['ngCookies','ngRoute','ngSanitize','LocalStorageModule','ui.bootstrap.modal']);
//-------------------------------------------------------------------------------------------------------------------
/*app.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://192.168.1.15/**']);
})*/

/*app.filter('trustUrl', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
});
app.controller('mainController', ['$http', '$location', '$window','$scope', function ($http,$location, $window,cartService,carService,ProductModel,$scope ) {
    let self = this;
    self.userName = "noa";
    let ip  = "192.168.1.15";
    let testURL ="2017-12-08 03:04:44.000";
    self.videoURL="10.100.102.10:4001/api/video/" + testURL;

    self.changeVideo = function (user) {
        self.videoURL="10.100.102.10:4001/api/video/2017-12-09 04:54:25.000";
    };
    /*self.userService = UserService;
    self.cookiesService=cookiesService;
    var userid=cookiesService.getCookie('user-id');
    var pass;
    pass = cookiesService.getCookie('user-pass');
    var last=cookiesService.getCookie('user-lastVisit');*/

/*    if (userid && pass) {
        var req = {
            method: 'POST',
            url: 'http://localhost:4000/Login',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "username": userid,
                "password": pass
            }
        }
        $http(req).then(function (ans) {
            var res = ans.data;
            if (Object.values(res)[0] === "Fail User Name") {
            }
            else if (Object.values(res)[0] === "Fail Password"){


            }
            else{
                ///cookies
                UserService.notLoggedIn = false;
                UserService.userId = userid;
                UserService.lastLogin = last;
                cookiesService.setNewLoginDate();
                UserService.token=Object.values(res)[0];
                // $window.location.href = '/#/';
            }
            $http.get('/GetNewCars')
                .then(function (response) {
                    self.newCars = response.data;
                    $http.get('/GetPopularCars')
                        .then(function (response) {
                            self.popCars = response.data;
                        }, function (errResponse) {
                            console.error('Error while fetching pop1');
                        });

                }, function (errResponse) {
                    console.error('Error while fetching new1');
                });
        });
    }
    else{
        $http.get('/GetNewCars')
            .then(function (response) {
                self.newCars = response.data;
                $http.get('/GetPopularCars')
                    .then(function (response) {
                        self.popCars = response.data;
                    }, function (errResponse) {
                        console.error('Error while fetching populars');
                    });

            }, function (errResponse) {
                console.error('Error while fetching new');
            });

    }

    self.getCarDetails = function (prodID) {
        self.url = "http://localhost:4000/GetCarDetailsByID/" + prodID;
        $http.get(self.url).then(function (response) {
            self.carDetails = response.data;

        }, function (errResponse) {
            console.error('Error while fetching car details');
        });

    };

    self.addToCart = function (prodID) {
        self.url = "http://localhost:4000/GetCarDetailsByID/" + prodID;
        $http.get(self.url).then(function (response) {
            self.carDetails = response.data[0];
            //console.log( self.carDetails);
            cartService.addToCart(new ProductModel(self.carDetails))
        }, function (errResponse) {
            console.error('Error while adding cart');
        });

    };
    self.buyCar = function (prodID) {
        buyService.buyCar(prodID);
    };

    $scope.open = function (carID) {
        self.getCarDetails(carID);
        $scope.showModal = true;
    };

    $scope.ok = function () {
        $scope.showModal = false;
    };

    $scope.cancel = function () {
        $scope.showModal = false;
    };
*/
/*}]);

//});




//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);
app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",
            controller : "mainController"
        })
        /*.when("/login", {
            templateUrl : "views/login-old.html",
            controller : "loginController"
        })
        .when("/register", {
            templateUrl : "views/register-old.html",
            controller : "registerController"
        })
        .when("/cities", {
            templateUrl : "views/cities.html",
            controller: 'citiesController'
        })
        .when("/products", {
            templateUrl : "views/products.html",
            controller: 'storeCtrl'
        })
        .when("/about", {
            templateUrl : "views/about.html",
            controller: 'aboutCtrl'
        })
        .when("/cart", {
            templateUrl : "views/cart.html"
        })*/
     /*   .otherwise({redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------


var users = [];*/