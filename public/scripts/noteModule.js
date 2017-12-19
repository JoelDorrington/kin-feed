angular.module("NoteContent", ["Slider"])

.controller("NoteCtrl", ["$scope", function($scope){
  this.$onInit = function(){
    $scope.item = this.item;
  };
  $scope.recipOrThread = function(item){
    if(item.recipient){
      return item.recipient.username;
    } else if (item.thread){
    return "in " + item.thread;
    }
  };
}])

.component("jdNoteHeader", {
    restrict: 'E',
    templateUrl: 'view_templates/noteHeader.html',
    bindings: {
      item: "<"
    },
    controller: "NoteCtrl"
})