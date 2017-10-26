angular.module("Hub", [])

.controller("BodyCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.currentUser = DataService.user;
  $scope.$watch(function(){return DataService.user; }, function(user){
    $scope.currentUser = user;
  });
}])

.controller("HubCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.data = {};
  $scope.data.myNotes = DataService.notes;
  $scope.data.activity = DataService.recentActivity;
  $scope.$watch(function(){return DataService.notes }, function(notes){
    $scope.data.myNotes = notes;
    
  });
  $scope.$watch(function(){return DataService.recentActivity }, function(activity){
    $scope.data.activity = activity.notes;
  });
}])

.controller("PublicCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.publicData = {};
  $scope.publicData.users = DataService.users;
  $scope.publicData.threads = DataService.threads;
  $scope.publicData.publicNotes = DataService.publicNotes;
}])

.service("DataService", function($http){
  var dataService = {};
  
  $http.get("/hub/notes").then(function(response){
      dataService.notes = response.data;
    }).catch(function(error){
      console.log(error);
    });
  
    $http.get("/user").then(function(response){
      dataService.user = response.data;
    }).catch(function(error){
      console.log(error);
    });
  
  $http.get("/hub/recentactivity").then(function(response){
      function modifiedData(subject){
        for(var i in subject.notes){
          if(subject.notes[i].kind == "Memory"){
            subject.notes[i].kind = "a memory";
          }
        }
        return subject;
      }
      dataService.recentActivity = modifiedData(response.data);
    });
  
  $http.get("/hub/public").then(function(response){
    dataService.publicNotes = response.data.notes;
    dataService.users = response.data.users;
    dataService.threads = response.data.threads;
  });
  
  return dataService;
})