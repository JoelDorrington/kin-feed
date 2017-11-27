angular.module("PinHub", ['angularMoment'])

.controller("BodyCtrl", ["$scope", "PinnedDataService", function($scope, PinnedDataService){
  $scope.currentUser = PinnedDataService.user;
  $scope.$watch(function(){return PinnedDataService.user; }, function(user){
    $scope.currentUser = user;
  });
}])

// PUBLIC CONTROLLER
.controller("PinnedCtrl", ["$scope", "PinnedDataService", 'moment', '$routeParams', function($scope, PinnedDataService, moment, $routeParams){
  $scope.pinnedData = {};
  $scope.pinnedData.groups = PinnedDataService.pinnedNoteGroups;
  $scope.pinnedData.query = $routeParams.query || '';
  // Watch Note Groups
  $scope.$watch(function(){return PinnedDataService.pinnedNoteGroups; }, function(noteGroups){
    for(var i in noteGroups){
      for(var j in noteGroups[i].notes){
        if(noteGroups[i].notes[j].likes.users.indexOf(String(PinnedDataService.user._id)) > -1){
        noteGroups[i].notes[j].liked = true;
      } else {
        noteGroups[i].notes[j].liked = false;
      }
      }
    }
    $scope.pinnedData.groups = noteGroups;
  });
  $scope.pinnedData.recipOrThread = function(item){
    if(item.recipient){
      return "to " + item.recipient.username;
    } else if (item.thread){
    return "in " + item.thread;
    }
  };
    $scope.pinnedData.like = function(id){
    PinnedDataService.like(id);
    for( var i in $scope.pinnedData.groups ){
      for(var j in $scope.pinnedData.groups[i].notes){
        if($scope.pinnedData.groups[i].notes[j]._id == id){
          if($scope.pinnedData.groups[i].notes[j].liked){
            $scope.pinnedData.groups[i].notes[j].likes.total--;
            $scope.pinnedData.groups[i].notes[j].likes.users.splice($scope.pinnedData.groups[i].notes[j].likes.users.indexOf(String(PinnedDataService.user._id)), 1);
            $scope.pinnedData.groups[i].notes[j].liked = false;
          } else {
            $scope.pinnedData.groups[i].notes[j].likes.total++;
            $scope.pinnedData.groups[i].notes[j].likes.users.push(String(PinnedDataService.user._id));
            $scope.pinnedData.groups[i].notes[j].liked = true;
          }}}}};
          
  $scope.pinnedData.unpin = function(id){
    PinnedDataService.unpin(id);
    for( var i in $scope.pinnedData.groups ){
      for(var j in $scope.pinnedData.groups[i].notes){
        if($scope.pinnedData.groups[i].notes[j]._id == id){
          $scope.pinnedData.groups[i].notes.splice(j, 1);
          if($scope.pinnedData.groups[i].notes.length < 1){
            $scope.pinnedData.groups.splice(i, 1);
          }
        }}}};
}])

// DATA SERVICE
.service("PinnedDataService", function($http){
  var dataService = {};
  
  dataService.like = function(id){
    $http.get("/notes/likes/" + id).then(function(response){
      dataService.likes = response.data.likes;
    });
  };

  dataService.unpin = function(id){
    var data = {
      action: false,
      id: id
    };
    $http.post("/pin", data).then(function(response){
      dataService.pinnedNoteGroups = response.data;
    });
  };
  
  // Fetch Current User
  $http.get("/ajax/pinneduser").then(function(response){
    dataService.user = response.data;
    dataService.pinnedNoteGroups = response.data.pinnedNoteGroups;
  }).catch(function(error){
    console.log(error);
  });
  
  $http.get("/ajax/threads").then(function(response){
    dataService.threads = response.data;
  }).catch(function(error){
    console.log(error);
  });

  return dataService;
})