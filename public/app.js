
let app = angular.module('myApp', [
    'ngRoute',
    'mobile-angular-ui',
    'ngCookies',
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

app.controller('mainController', ['AuthenticationService','$http', '$location', '$window','$rootScope','$scope','programService', function (AuthenticationService,$http,$location, $window,$rootScope,$scope,programService) {
    let self = this;

    self.authService = AuthenticationService;
    //$window.alert("username: "+ self.authService.userId );
    self.logout = function()
    {
        AuthenticationService.ClearCredentials();
        $window.alert("loggedOut");

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

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
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
        .otherwise({redirect: '/',
        });
}]);
