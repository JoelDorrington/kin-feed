angular.module("Hub", ['angularMoment', 'Slider'])

.controller("BodyCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.currentUser = DataService.user;
  $scope.jdError = DataService.error;
  $scope.$watch(function(){return DataService.error; }, function(error){
    $scope.jdError = error;
    console.log($scope.jdError);
  });
  $scope.$watch(function(){return DataService.user; }, function(user){
    $scope.currentUser = user;
  });
}])

// PUBLIC CONTROLLER
.controller("PublicCtrl", ["$scope", "DataService", 'moment', '$routeParams', "$location", function($scope, DataService, moment, $routeParams, $location){
  $scope.publicData = {};
  $scope.publicData.thread = $routeParams.thread;
  $scope.publicData.newGroup = '';
  $scope.publicData.groups = [];
  $scope.publicData.threads = DataService.threads;
  $scope.publicData.publicNotes = DataService.publicNotes;
  $scope.publicData.query = '';
  // Watch Notes
  $scope.$watch(function(){if(DataService.userfound){return DataService.groups}}, function(groups){
    $scope.publicData.groups = groups;
  });
  $scope.$watch(function(){return DataService.publicNotes; }, function(notes){
    if($scope.publicData.thread){
      var filteredNotes = [];
      for(var x in notes){
        if(notes[x].thread == $scope.publicData.thread){
          filteredNotes.push(notes[x]);
        }
      }
      notes = filteredNotes;
    }
    for( var i in notes ){
      notes[i].menu = false;
      notes[i].menustay = false;
      notes[i].group = '';
      if(notes[i].likes.users.indexOf(String(DataService.user._id)) > -1){
        notes[i].liked = true;
      } else {
        notes[i].liked = false;
      }
      for(var j in DataService.groups){
        if(DataService.groups[j].notes.indexOf(String(notes[i]._id))>-1){
          notes[i].pinned = true;
          notes[i].group = DataService.groups[j].groupName;
          break;
        } else {
          notes[i].pinned = false;
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
    DataService.like(id, function(){
      for( var i in $scope.publicData.publicNotes ){
        if($scope.publicData.publicNotes[i]._id == id){
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
    });
  };
  $scope.publicData.viewThread = function(theme){
    $scope.publicData.query = theme;
  };
  $scope.publicData.recipOrThread = function(item){
    if(item.recipient){
      return "to " + item.recipient.username;
    } else if (item.thread){
    return "in " + item.thread;
    }
  };
  $scope.publicData.pin = function(entry, groupName){
    entry.menustay = false;
    entry.menu = false;
    if(entry.pinned){
      DataService.pin(false, entry._id, groupName);
      entry.pinned = false;
      entry.group = '';
    } else {
      DataService.pin(true, entry._id, groupName);
      entry.pinned = true;
      entry.group = groupName;
    }
    $scope.publicData.newGroup = '';
  };
  $scope.refreshPub = function(){
    DataService.refreshPub();
  };
  $scope.refreshPin = function(){
    DataService.refreshPin();
  };
  $scope.refreshHome = function(){
    DataService.refreshHome();
  };
}])

// DATA SERVICE
.service("DataService", function($http, $routeParams){
  var dataService = {};
  dataService.error = {
    error: false,
    message: '',
    response: ''
  };
  
  dataService.userfound = false;
  
  dataService.like = function(id, cb){
    $http.get("/notes/likes/" + id).then(function(response){
      dataService.likes = response.data.likes;
      cb();
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to do that",
          response: error.statusText
        };
        console.log(error);
        dataService.error = _;
    });
  };
  
  dataService.refreshPub = function(){
    $http.get("/ajax/user").then(function(response){
      dataService.user = response.data;
      dataService.groups = response.data.pinnedNoteGroups;
      dataService.userfound = true;
      // Fetch Notes
      $http.get("/ajax/notes").then(function(response){
        dataService.publicNotes = response.data;
      }).catch(function(error){
        var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve public posts",
          response: error.statusText
        };
        dataService.error = _;
      });
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve your user data",
          response: error.statusText
        };
        dataService.error = _;
    });
    $http.get("/ajax/threads").then(function(response){
      dataService.threads = response.data;
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve thread data",
          response: error.statusText
        };
        dataService.error = _;
    });
  };
  
  dataService.refreshPin = function(){
    $http.get("/ajax/pinneduser").then(function(response){
      dataService.pinnedNoteGroups = response.data.pinnedNoteGroups;
      dataService.personalNotes = response.data.receivedNotes;
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve your user data",
          response: error.statusText
        };
        dataService.error = _;
    });
  };
  
  dataService.refreshHome = function(){
    $http.get("/ajax/personalnotes").then(function(response){
      dataService.groups = response.data.pinnedNoteGroups;
      dataService.personalNotes = response.data.receivedNotes;
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve your user data",
          response: error.statusText
        };
        dataService.error = _;
    });
  };
  
  dataService.unpin = function(id){
    var data = {
      action: false,
      id: id
    };
    $http.post("/pin", data).then(function(response){
      dataService.pinnedNoteGroups = response.data;
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to unpin that post",
          response: error.statusText
        };
        dataService.error = _;
    })
  };
  
  dataService.pin = function(pin, id, groupName){
    var data = {
      action: pin,
      id: id,
      groupName: groupName
    };
    $http.post("/pin", data).then(function(response){
      dataService.groups = response.data;
      if(pin){
        for(var i in dataService.user.pinnedNoteGroups)
          if(dataService.user.pinnedNoteGroups[i] == groupName){
             dataService.user.pinnedNoteGroups[i].notes.push(id);
          }
      } else {
        for(var i in dataService.user.pinnedNoteGroups){
          if(dataService.user.pinnedNoteGroups[i].notes.indexOf(id)>-1){
            dataService.user.pinnedNoteGroups[i].notes.splice(dataService.user.pinnedNoteGroups[i].notes.indexOf(id), 1);
          }
        }
      }
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to do that",
          response: error.statusText
        };
        dataService.error = _;
    })
  };
  // Fetch Current User
    $http.get("/ajax/user").then(function(response){
      dataService.user = response.data;
      dataService.groups = response.data.pinnedNoteGroups;
      dataService.userfound = true;
      // Fetch Notes
      $http.get("/ajax/notes").then(function(response){
        dataService.publicNotes = response.data;
      }).catch(function(error){
        var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve public posts",
          response: error.statusText
        };
        dataService.error = _;
        console.log(dataService.error);
      });
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve your user data",
          response: error.statusText
        };
        dataService.error = _;
      console.log(dataService.error);
    });
    
    $http.get("/ajax/pinneduser").then(function(response){
      dataService.user = response.data;
      dataService.pinnedNoteGroups = response.data.pinnedNoteGroups;
      dataService.personalNotes = response.data.receivedNotes;
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve your user data",
          response: error.statusText
        };
        dataService.error = _;
    })
    
    $http.get("/ajax/threads").then(function(response){
      dataService.threads = response.data;
    }).catch(function(error){
      var _ = {
          error: true,
          message: "Sorry, we were unable to retrieve thread data",
          response: error.statusText
        };
        dataService.error = _;
    });

  return dataService;
})

.directive("navMenu", function(){
  return {
    restrict: 'E',
    templateUrl: "view_templates/nav-menu.html"
  };
})

.directive("threads", function(){
  return {
    restrict: 'E',
    templateUrl: "view_templates/threads.html"
  };
});