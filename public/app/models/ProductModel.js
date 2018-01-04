
angular.module('myApp')
    .factory('ProductModel', [ function () {
        function Product(object) {
            this.CarSeriesID = object.CarSeriesID;
            this.Category = object.Category;
            this.Manufacturer = object.Manufacturer;
            this.Year = object.Year;
            this.Color = object.Color;
            this.UnitPrice = object.PriceNIS;
            this.NumInStock = object.NumInStock;
        }

        return Product;
    }]);
