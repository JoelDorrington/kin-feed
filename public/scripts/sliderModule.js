angular.module("Slider", [])

.controller("SlideCtrl", ["$scope", function($scope){
  $scope.id = '';
  this.$onInit = function(){
    $scope.id = this.id;
    
    $scope.slideIndex = 1;
    setTimeout(function(){console.log("showSlide executed"); $scope.showSlides($scope.slideIndex)}, 1000);
    
    $scope.plusSlides = function(n) {
      $scope.showSlides($scope.slideIndex += n);
    };
    
    $scope.currentSlide = function(n){
      $scope.showSlides($scope.slideIndex = n);
    };
    
    $scope.showSlides = function(n){
      var i;
      var slides = document.getElementsByClassName($scope.id+"Slide");
      var dots = document.getElementsByClassName($scope.id+"Dot");
      if (n > slides.length){$scope.slideIndex = 1;}
      if (n < 1){$scope.slideIndex = slides.length;}
      for (i = 0; i < slides.length; i++){
        slides[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++){
        dots[i].className = dots[i].className.replace(" active", "");
      }
      slides[$scope.slideIndex-1].style.display = "block";
      dots[$scope.slideIndex-1].className += " active";
    };
  };
}])

.component("jdSlider", {
    restrict: 'E',
    templateUrl: "view_templates/slider.html",
    bindings: {
      id: '@',
      images: '<'
      
    },
    transclude: true,
    controller: "SlideCtrl"
  });