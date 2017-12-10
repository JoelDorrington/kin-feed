angular.module("Home", ["Slider", "angularMoment", "Hub"])

.controller("HomeCtrl", ["$scope", "DataService", function($scope, DataService){
  $scope.homeData = {};
  $scope.homeData.notes = [];
  $scope.homeData.query = '';
  $scope.homeData.groups = [];
  $scope.homeData.newGroup = '';
  $scope.$watch(function(){if(DataService.userfound){return DataService.groups}}, function(groups){
    $scope.homeData.groups = groups;
  });
  $scope.$watch(function(){return DataService.personalNotes;}, function(notes){
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
    $scope.homeData.notes = notes;
  });
  $scope.homeData.pin = function(entry, groupName){
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
    $scope.homeData.newGroup = '';
  };
  $scope.homeData.like = function(id){
    DataService.like(id);
    for( var i in $scope.homeData.notes ){
      if($scope.homeData.notes[i]._id == id){
        if($scope.homeData.notes[i].liked){
          $scope.homeData.notes[i].likes.total--;
          $scope.homeData.notes[i].likes.users.splice($scope.homeData.notes[i].likes.users.indexOf(String(DataService.user._id)), 1);
          $scope.homeData.notes[i].liked = false;
        } else {
          $scope.homeData.notes[i].likes.total++;
          $scope.homeData.notes[i].likes.users.push(String(DataService.user._id));
          $scope.homeData.notes[i].liked = true;
        }
      }
    }
  };
  $scope.refreshHome = function(){
    DataService.refreshHome();
  };
  $scope.refreshPub = function(){
    DataService.refreshPub();
  };
  $scope.refreshPin = function(){
    DataService.refreshPin();
  };
}]);