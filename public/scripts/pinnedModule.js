angular.module("PinHub", ['angularMoment', 'Hub', 'Slider'])

// PINNED CONTROLLER
.controller("PinnedCtrl", ["$scope", "DataService", 'moment', '$routeParams', function($scope, DataService, moment, $routeParams){
  $scope.pinnedData = {};
  $scope.pinnedData.groups = DataService.pinnedNoteGroups;
  $scope.pinnedData.query = $routeParams.query || '';
  // Watch Note Groups
  $scope.$watch(function(){return DataService.pinnedNoteGroups; }, function(noteGroups){
    for(var i in noteGroups){
      for(var j in noteGroups[i].notes){
        if(noteGroups[i].notes[j].likes.users.indexOf(String(DataService.user._id)) > -1){
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
      return " to " + item.recipient.username;
    } else if (item.thread){
    return " in " + item.thread;
    }
  };
  $scope.pinnedData.like = function(id){
  DataService.like(id, function(){
    for( var i in $scope.pinnedData.groups ){
      for(var j in $scope.pinnedData.groups[i].notes){
        if($scope.pinnedData.groups[i].notes[j]._id == id){
          if($scope.pinnedData.groups[i].notes[j].liked){
            $scope.pinnedData.groups[i].notes[j].likes.total--;
            $scope.pinnedData.groups[i].notes[j].likes.users.splice($scope.pinnedData.groups[i].notes[j].likes.users.indexOf(String(DataService.user._id)), 1);
            $scope.pinnedData.groups[i].notes[j].liked = false;
          } else {
            $scope.pinnedData.groups[i].notes[j].likes.total++;
            $scope.pinnedData.groups[i].notes[j].likes.users.push(String(DataService.user._id));
            $scope.pinnedData.groups[i].notes[j].liked = true;
    } } } }  
  });
  };
          
  $scope.pinnedData.unpin = function(id){
    DataService.unpin(id);
    for( var i in $scope.pinnedData.groups ){
      for(var j in $scope.pinnedData.groups[i].notes){
        if($scope.pinnedData.groups[i].notes[j]._id == id){
          $scope.pinnedData.groups[i].notes.splice(j, 1);
          if($scope.pinnedData.groups[i].notes.length < 1){
            $scope.pinnedData.groups.splice(i, 1);
          }
        }}}};
  $scope.refreshPub = function(){
    DataService.refreshPub();
    console.log('refreshed pub from pin')
  };
  $scope.refreshPin = function(){
    DataService.refreshPin();
    console.log("refreshed pin from pin")
  };
  $scope.refreshHome = function(){
    DataService.refreshHome();
  };
}]);