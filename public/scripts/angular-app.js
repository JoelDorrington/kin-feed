var app = angular.module("FamilyApp", ["ngRoute", "Hub", "PinHub", "Home", "ngAnimate"]);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/public", {
            templateUrl: "view_templates/public.html",
            controller: "PublicCtrl"
        })
        .when("/pinned", {
            templateUrl: "view_templates/pinned.html",
            controller: "PinnedCtrl" 
        })
        .when("/home", {
            templateUrl: "view_templates/home.html",
            controller: "HomeCtrl"
        })
        .when("/thread/:thread", {
            templateUrl: "view_templates/view-thread.html",
            controller: "PublicCtrl"
        })
        .otherwise({
            redirectTo: "/public"
        });
});