
let app = angular.module('myApp', ['ngCookies','ngRoute','ngSanitize','LocalStorageModule','ui.bootstrap.modal']);
//-------------------------------------------------------------------------------------------------------------------

/*app.controller("MyCtrl", function($scope) {

    $scope.open = function() {
        $scope.showModal = true;
    };

    $scope.ok = function() {
        $scope.showModal = false;
    };

    $scope.cancel = function() {
        $scope.showModal = false;
    };

});*/


/*app.controller('mainController', ['$http','UserService','$location','$window','buyService','cartService','carService','ProductModel','$scope', function ($http,UserService,$location,$window,buyService,cartService,carService,ProductModel,$scope) {
    let self = this;
    self.userService = UserService;
    $http.get('/GetPopularCars')
        .then(function (response) {
        self.popCars = response.data;
            $http.get('/GetNewCars')
                .then(function (response) {
                    self.newCars = response.data;
                }, function (errResponse) {
                    console.error('Error while fetching notes');
                });
    }, function (errResponse) {
        console.error('Error while fetching popular cars');
    });

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
            console.error('Error while fetching notes');
        });

    };
    self.buyCar = function (prodID) {
        buyService.buyCar(prodID);
};

    $scope.open = function(carID) {
        self.getCarDetails(carID);
        $scope.showModal = true;
    };

    $scope.ok = function() {
        $scope.showModal = false;
    };

    $scope.cancel = function() {
        $scope.showModal = false;
    };
}]);*/
/*app.controller('mainController', ['$http','UserService','$location','$window','buyService','cartService','carService','ProductModel','$scope', function ($http,UserService,$location,$window,buyService,cartService,carService,ProductModel,$scope) {*/

app.controller('mainController', ['$http','UserService','cookiesService', '$location', '$window','cartService','carService','ProductModel','$scope', function ($http,UserService, cookiesService,$location, $window,cartService,carService,ProductModel,$scope ) {
    let self = this;
    self.userService = UserService;
    self.cookiesService=cookiesService;
    var userid=cookiesService.getCookie('user-id');
    var pass;
    pass = cookiesService.getCookie('user-pass');
    var last=cookiesService.getCookie('user-lastVisit');

    $http.get('/GetPopularCars')
        .then(function (response) {
            self.popCars = response.data;
           // $http.get('/GetNewCars')
                //.then(function (response) {
                    if (userid && pass) {
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
                            if (Object.values(res)[0] == "Login Succeed") {
                                ///cookies
                                UserService.notLoggedIn = false;
                                UserService.userId = userid;
                                UserService.lastLogin = last;
                                cookiesService.setNewLoginDate();
                                $window.location.href = '/#/';
                            }
                            $http.get('/GetNewCars')
                                .then(function (response) {
                                    self.newCars = response.data;
                                }, function (errResponse) {
                                    console.error('Error while fetching notes');
                                });

                        }, function (errResponse) {
                            console.error('Error while fetching notes');
                        });
                    }

              /*  }, function (errResponse) {
                    console.error('Error while fetching notes');
                });*/
        });
    /*if (userid&&pass ) {
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
            if (Object.values(res)[0] == "Login Succeed") {
                ///cookies
                UserService.notLoggedIn = false;
                UserService.userId = userid;
                cookiesService.setNewLoginDate();
                $window.location.href = '/#/';
            }
            $http.get('/GetPopularCars')
                .then(function (response) {
                    self.popCars = response.data;
                    $http.get('/GetNewCars')
                        .then(function (response) {
                            self.newCars = response.data;
                        }, function (errResponse) {
                            console.error('Error while fetching notes');
                        });
                }, function (errResponse) {
                    console.error('Error while fetching notes');
                });

        }, function (errResponse) {
            console.error('Error while fetching notes');
        });
    }*/
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
                console.error('Error while fetching notes');
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

}]);



app.controller('storeCtrl', function (ProductModel, restService, $rootScope, cartService,UserService,$http,$scope) {
    var vm = this;
    vm.products = [];
    vm.fieldToOrderBy = "Id";
    vm.reverseSort = false;
    vm.filterBy = "";
    vm.selectedCategory = ""
    // vm.cart = new cartFactory();

    // cartFactory.initialize();

    $http.get('/GetAllCategories')
        .then(function (response) {
            vm.categories = response.data;

             var req = {
             method: 'POST',
             url: '/GetRecommends',
             headers: {
             'Content-Type': "application/json"
             },
             data: {
             "username":UserService.userId
             }
             }
             $http(req)
                .then(function (response) {
                    console.log(response.data);
                    vm.recommendsCars = response.data;
                }, function (errResponse) {
                    console.error('Error while fetching notes');
                });
        }, function (errResponse) {
            console.error('Error while fetching notes');
        });

    vm.addToCart = function (prodID) {
        vm.url = "http://localhost:4000/GetCarDetailsByID/" + prodID;
        $http.get(vm.url).then(function (response) {
            vm.carDetails = response.data[0];
            //console.log( self.carDetails);
            cartService.addToCart(new ProductModel(vm.carDetails))
        }, function (errResponse) {
            console.error('Error while fetching notes');
        });

    };

    vm.getAllProducts = function () {
        var reqUrl = "http://localhost:4000/GetAllCars";
        var ans = restService.Get(reqUrl, function (response) {
            vm.products = [];
            //get details
            angular.forEach(response, function (product) {
                vm.products.push(new ProductModel(product));
            })
        });
    }

    vm.addCart = function (product) {
        cartService.addToCart(product);
    }

    vm.getCarDetails = function (prodID) {
        vm.url = "http://localhost:4000/GetCarDetailsByID/" + prodID;
        $http.get(vm.url).then(function (response) {
            vm.carDetails = response.data;

        }, function (errResponse) {
            console.error('Error');
        });

    }
    $scope.open = function(carID) {
        vm  .getCarDetails(carID);
        $scope.showModal = true;
    };

    $scope.ok = function() {
        $scope.showModal = false;
    };

    $scope.cancel = function() {
        $scope.showModal = false;
    };



});

app.controller('cartController', function (ProductModel, $rootScope,UserService, cartService, $scope,$http) {
    var vm = this;
    // vm.cart = new cartFactory();
    vm.fieldToOrderBy = "UnitPrice";
    vm.reverseSort = false;
    vm.cart= [];


    vm.removeFromCart = function (product) {
        cartService.removeFromCart(product);
        vm.calculateTotal();
    }

    vm.calculateTotal = function () {
        var cart = cartService.getCart();
        vm.cart = cart[0];
        vm.totalItems = 0;
        vm.totalPrice = 0;
        for (i=0; i< vm.cart.length; i++) {
            vm.totalItems += vm.cart[i].quantity;
            vm.totalPrice += vm.cart[i].quantity * vm.cart[i].theItem.UnitPrice;
        }
    }

    vm.calculateTotal();

    vm.getPrevOrders = function () {
        var req = {
            method: 'POST',
            url: 'http://localhost:4000/getPrevOrders',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "username": UserService.userId
            }
        }
        $http(req).then(function (ans) {
            vm.prevOrders = ans.data;
        }, function (errResponse) {
            console.error('Error');
        });

    }

    vm.getCarDetails = function (prodID) {
        vm.url = "http://localhost:4000/GetCarDetailsByID/" + prodID;
        $http.get(vm.url).then(function (response) {
            vm.carDetails = response.data;

        }, function (errResponse) {
            console.error('Error');
        });

    }
    vm.getOrderDet = function (orderid) {
        var req = {
            method: 'POST',
            url: 'http://localhost:4000/getOrderDetails',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "OrderID": orderid
            }
        }
        $http(req).then(function (res) {
            vm.orderDetails = res.data;
        }, function (errResponse) {
            console.error('Error');
        });

    }


    $scope.open = function (carID) {
        vm.getCarDetails(carID);
        $scope.showModal = true;
    };
    $scope.ok = function () {
        $scope.showModal = false;
    };

    $scope.cancel = function () {
        $scope.showModal = false;
    };

    $scope.openOrdersModal = function (orderId) {
        vm.getOrderDet(orderId);
        $scope.showModalOrders = true;
    };

    $scope.okOrdersModal = function () {
        $scope.showModalOrders = false;
    };

    $scope.cancelOrdersModal = function () {
        $scope.showModalOrders = false;
    };
});



//-------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------
app.controller('citiesController', ['$http', function($http) {
        let self = this;
        self.fieldToOrderBy = "name";
        // self.cities = [];
        self.getCities = function () {
            $http.get('/cities')
                .then(function (res) {
                    self.cities = res.data;
                });
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('UserService', ['$http', function($http) {
    let service = {};
    service.notLoggedIn = true;
    service.userId="guest";
    service.lastLogin="";
    service.login = function(user) {
        return $http.post('/login', user)
            .then(function(response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.username
                };
                service.notLoggedIn = false;
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
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
        .when("/login", {
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
        })
        .otherwise({redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
/*app.controller('registerController', ['UserService', '$location', '$window',
    function(UserService, $location, $window) {
        let self = this;
        self.user = {username: '', password: ''};
        self.register = function(valid) {
            if (valid) {
                UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
        };
    }]);*/



//app.controller('registerController', function(UserModel, restService, $rootScope, $location){
    /*
    var vm1 = this;
    vm1.registerVar = 10;

    vm1.user = new UserModel();


    vm1.register = function () {

        users.push(vm1.user);
        var reqUrl = $rootScope.path + "insertClients";
        if (vm1.user.isAdmin == "")
            vm1.user.isAdmin = false;
        else
            vm1.user.isAdmin = true;

        restService.Post(reqUrl, vm1.user, function (ans) {
            if (ans.state) {
                alert("Registration Complete, Go to Login Page");
                $location.path('/login');
            }
            else
            {
                alert(ans.message);
            }
        });

    }
     */
//});


var users = [];