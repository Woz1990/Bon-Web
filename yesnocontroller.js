var app = angular.module('mainApp');

app.controller('YesNoController', ['$scope', 'close', function($scope, close) {

  $scope.close = function(result) {
 	  close(result, 500); // close, but give 500ms for bootstrap to animate
  };

}]);