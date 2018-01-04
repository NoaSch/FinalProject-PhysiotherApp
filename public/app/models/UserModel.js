angular.module('myApp')
    .factory('UserModel', [ function () {
        function User(object) {
            this.Id = object.Id;
            this.FirstName = object.FirstName;
            this.LastName = object.LastName;
            this.City =  object.City;
            this.Country = object.Country;
            this.Phone = object.Phone;
            this.Mail = object.Mail;
            this.CreditCardNumber = object.CreditCardNumber;
            this.isAdmin = object.isAdmin;
            this.Password ="";

        }
        function User() {
            this.Id = "";
            this.FirstName = "";
            this.LastName = "";
            this.City =  "";
            this.Country = "";
            this.Phone = "";
            this.Mail = "";
            this.CreditCardNumber = "";
            this.isAdmin = "";
            this.Password ="";

        }

        return User;
    }]);
