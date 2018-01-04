
angular.module("myApp")
    .controller('registerController', [ '$scope', 'UserService','$http', '$location', '$window',
    function($scope, UserService,$http, $location, $window){
        var vm1 = this;
        $scope.css=outcss;
        $scope.selected=[];
        $scope.selectedVslues=[];
        $scope.$watch('selected', function (nowSelected) {

            $scope.selectedVslues=[];
            if (!nowSelected){

                return;
            }
            angular.forEach(nowSelected, function(val){
                $scope.selectedVslues.push(val.toString());

            });

        });

        $http.get("app/countries.xml",
            {
                transformResponse: function (cnv) {
                    var x2js = new X2JS();
                    var aftCnv = x2js.xml_str2json(cnv);
                    return aftCnv;
                }
            })
            .then(function (response) {
                vm1.countries = response.data.Countries.Country;
            });

        vm1.register = function () {

            vm1.mult=[];
            angular.forEach($scope.selectedVslues, function(value) {
                vm1.mult.push(value.toString());
            });


            var req = {
                method: 'POST',
                url: 'http://localhost:4000/Register',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": vm1.Id,
                    "password":vm1.Password ,
                    "FirstName": vm1.FirstName,
                    "LastName": vm1.LastName,
                    "Email": vm1.Mail,
                    "Address": vm1.Address,
                    "Country":  vm1.Country,
                    "Q1": vm1.Q1,
                    "Ans1": vm1.Ans1,
                    "Q2": vm1.Q2,
                    "Ans2": vm1.Ans2,
                    "Telephone": vm1.Telephone,
                    "CreditCardNumber": vm1.CreditCardNumber,
                    //"Categories":[ "Private", "Mini", "SUV"]
                    "Categories": vm1.mult
                }
            }
            $http(req).then(function (response) {
                //console.error($scope.selectedVslues);
                var res = response.data;
                if (Object.values(res)[0] === "Inserted"){
                    alert("Registration Complete, Go to Login Page");
                    $location.path('/login');
                }
                else if (Object.values(res)[0]=== "Username already exists")  {
                    alert("Username already exists");
                }
                else {
                    alert(Object.values(res)[0]);

                }

            }, function (errResponse) {
                console.error('Error while register');
            });

        }
    }]);


var users = [];

