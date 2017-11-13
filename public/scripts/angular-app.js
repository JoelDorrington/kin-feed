var app = angular.module("FamilyApp", ["ngRoute", "Hub"]);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.hashPrefix('');
    // $routeProvider
        // .when("/", {
        //     controller: "PublicCtrl"
        // })
        // .when("/:query", {
        //     controller: "PublicCtrl"
        // })
        // .otherwise({
        //     redirectTo: "/"
        // });
});