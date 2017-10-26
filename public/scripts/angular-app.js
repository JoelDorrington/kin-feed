var app = angular.module("FamilyApp", ["ngRoute", "Hub"]);

app.config(function($routeProvider, $locationProvider){
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/", {
            templateUrl: "view_templates/hub.html",
            controller: "HubCtrl"
        })
        .when("/public", {
            templateUrl: "view_templates/public.html",
            controller: "PublicCtrl"
        })
        .otherwise({
            redirectTo: "/hub"
        });
});