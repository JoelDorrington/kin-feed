angular.module("Hub", [])

.controller("BodyCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.currentUser = DataService.user;
  $scope.$watch(function(){return DataService.user; }, function(user){
    $scope.currentUser = user;
  });
}])

// PUBLIC CONTROLLER
.controller("PublicCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.publicData = {};
  $scope.publicData.threads = DataService.threads;
  $scope.publicData.publicNotes = DataService.publicNotes;
  $scope.publicData.query = "";
  $scope.$watch(function(){return DataService.publicNotes; }, function(notes){
    $scope.publicData.publicNotes = notes;
  });
  $scope.$watch(function(){return DataService.threads; }, function(threads){
    $scope.publicData.threads = threads;
    console.log(threads);
  });
}])

// DATA SERVICE
.service("DataService", function($http){
  var dataService = {};
  
  // Fetch Notes
  $http.get("/ajax/notes").then(function(response){
      dataService.publicNotes = response.data;
    }).catch(function(error){
      console.log(error);
    });
  
  // Fetch Current User
    $http.get("/ajax/user").then(function(response){
      dataService.user = response.data;
    }).catch(function(error){
      console.log(error);
    });
    
    $http.get("/ajax/threads").then(function(response){
      dataService.threads = response.data;
      console.log(dataService.threads);
    }).catch(function(error){
      console.log(error);
    });
  
  // Fetch Recent Activity
  // $http.get("/hub/recentactivity").then(function(response){
  //     function modifiedData(subject){
  //       for(var i in subject.notes){
  //         if(subject.notes[i].kind == "Memory"){
  //           subject.notes[i].kind = "a memory";
  //         }
  //       }
  //       return subject;
  //     }
  //     dataService.recentActivity = modifiedData(response.data);
  //   });

  return dataService;
})

.directive("navMenu", function(){
  return {
    restrict: 'E',
    templateUrl: "view_templates/nav-menu.html"
  };
})