angular.module("Hub", ['angularMoment'])

.controller("BodyCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.currentUser = DataService.user;
  $scope.$watch(function(){return DataService.user; }, function(user){
    $scope.currentUser = user;
  });
}])

// PUBLIC CONTROLLER
.controller("PublicCtrl", ["$scope", "DataService", 'moment', '$routeParams', function($scope, DataService, moment, $routeParams){
  $scope.exampleDate = moment().hour(8).minute(0).second(0).toDate();
  $scope.publicData = {};
  $scope.publicData.threads = DataService.threads;
  $scope.publicData.publicNotes = DataService.publicNotes;
  $scope.publicData.query = $routeParams.query || '';
  // Watch Notes
  $scope.$watch(function(){return DataService.publicNotes; }, function(notes){
    for( var i in notes ){
      if(DataService.user){
        if(notes[i].likes.users.indexOf(String(DataService.user._id)) > -1){
          notes[i].liked = true;
        } else {
          notes[i].liked = false;
        }
      }
    }
    $scope.publicData.publicNotes = notes;
  });
  // Watch Threads
  $scope.$watch(function(){return DataService.threads; }, function(threads){
    $scope.publicData.threads = threads;
  });
  // Like Function
  $scope.publicData.like = function(id){
    DataService.like(id);
    for( var i in $scope.publicData.publicNotes ){
      if($scope.publicData.publicNotes[i]._id == id){
        console.log($scope.publicData.publicNotes[i].likes.users.indexOf(String(DataService.user._id)));
        if($scope.publicData.publicNotes[i].liked){
          $scope.publicData.publicNotes[i].likes.total--;
          $scope.publicData.publicNotes[i].likes.users.splice($scope.publicData.publicNotes[i].likes.users.indexOf(String(DataService.user._id)), 1);
          $scope.publicData.publicNotes[i].liked = false;
        } else {
          $scope.publicData.publicNotes[i].likes.total++;
          $scope.publicData.publicNotes[i].likes.users.push(String(DataService.user._id));
          $scope.publicData.publicNotes[i].liked = true;
        }
      }
    }
  };
  $scope.publicData.viewThread = function(theme){
    $scope.publicData.query = theme;
  };
}])

// DATA SERVICE
.service("DataService", function($http){
  var dataService = {};
  
  dataService.like = function(id){
    $http.get("/notes/likes/" + id).then(function(response){
      dataService.likes = response.data.likes;
    });
  };
  
  // Fetch Current User
    $http.get("/ajax/user").then(function(response){
      dataService.user = response.data;
      // Fetch Notes
      $http.get("/ajax/notes").then(function(response){
        dataService.publicNotes = response.data;
      }).catch(function(error){
        console.log(error);
      });
    }).catch(function(error){
      console.log(error);
    });
    
    $http.get("/ajax/threads").then(function(response){
      dataService.threads = response.data;
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