angular.module('myApp')
    .factory('PhysiotherapistModel', [ function () {
        function Physiotherapist(object) {
            this.username = object.username;
            this.FirstName = object.first_name;
            this.LastName = object.last_name;
            this.Phone = object.phone;
            this.Mail = object.mail;
            console.log(this.username + " created")
        }
        function Physiotherapist(username,FirstName,LastName,Phone,Mail) {
            this.username = username;
            this.FirstName = FirstName;
            this.LastName = LastName;
            this.Phone = Phone;
            this.Mail = Mail;
        }

        return Physiotherapist;
    }]);
