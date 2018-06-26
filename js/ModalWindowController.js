var app = angular.module('bonApp');

app.controller('ModalWindowController', ['$scope', "$timeout", 'title', 'resultText', 'time', 'close', function($scope, $timeout, title, resultText, time, close) {
	$scope.title = resultText;
	$scope.resultText = resultText;
	$timeout(function () {
      $scope.close(false);
  }, time);

  $scope.close = function(result) {
 	  close(result, 500); // close, but give 500ms for bootstrap to animate
  };

}]);