angular.module('myApp')
    .service('cookiesService', cookiesService);


function cookiesService (localStorageService) {

    this.addNewCookies = function (userID, userPass) {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        localStorageService.cookie.add('user-id', userID);
        localStorageService.cookie.add('user-pass', userPass);
        var today = new Date();
        var todayStr = today.toDateString();
        localStorageService.cookie.add('user-lastVisit', todayStr);

        return today;
    };

    this.setNewLoginDate = function () {
        var expireDate = new Date();
        var today = new Date();
        localStorageService.cookie.set('user-lastVisit', today.toDateString());
        return today;
    };

    this.removeAll = function () {
        localStorageService.cookie.remove('user-id');
        localStorageService.cookie.remove('user-lastVisit');

    };

    this.getCookie = function(cookieName) {
        var ans = localStorageService.cookie.get(cookieName);
        return ans;
    };


}
