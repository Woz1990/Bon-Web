angular.module("bonApp").controller('LoginController', function($scope, $window, $location, $http, $localStorage, ModalService) {
	$scope.login_mode = true;
	$scope.error_message = "";
	//logout();

	getToken = function(){
		return $window.localStorage['jwtToken'];
	}

	logout = function() {
	  $window.localStorage.removeItem('jwtToken');
	}

	$scope.ReverseLoginMode = function(){
		$scope.login_mode = !$scope.login_mode;
		$scope.canAuthenticate = true;
		$scope.forgottenPasswordEmailRequired = false;
		$scope.error_message = "";
	}

	$scope.SendPassword = function(){
		$scope.forgottenPasswordEmailRequired = false;
		if($scope.email_forgotten_password == "" || $scope.email_forgotten_password == undefined){
			$scope.forgottenPasswordEmailRequired = true;
			return;
		}
		requestUrl = "http://127.0.0.1:3000/forgot_password";
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify({
	    		email: $scope.email_forgotten_password,
			    })
			});
		request.success(function (data) {
			ModalService.showModal({
					templateUrl: "templates/requestResultWindow.html",
					controller: "ModalWindowController",
					title: "Success",
					textToShow: data,
					time: 2000,
					preClose: (modal) => { modal.element.modal('hide'); }
				}).then(function(modal) {
				    	modal.element.modal();
				});
			$scope.ReverseLoginMode();
		}).error(function (data){
			$scope.error_message = "Account with this email doesn't exist";
		});
	}
	
	$scope.PasswordCheck = function(){
		$scope.canAuthenticate = true;
		$scope.emailRequired = false;
		$scope.passwordRequired = false;
		if($scope.email == "" || $scope.email == undefined){
			$scope.emailRequired = true;
			$scope.canAuthenticate = false;
		}
		if($scope.password == "" || $scope.password == undefined){
			$scope.passwordRequired = true;
			$scope.canAuthenticate = false;
		}
		if($scope.canAuthenticate == false) return;
		requestUrl = "http://127.0.0.1:3000/authentication";
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify({
	    		email: $scope.email,
		        password: $scope.password,
			    })
			});
		request.success(function (data) {
			$window.localStorage['jwtToken'] = data;
			$location.path("/showAllFoodItems");
		}).error(function (data){
			ModalService.showModal({
					templateUrl: "templates/requestResultWindow.html",
					controller: "ModalWindowController",
					title: "Error",
					textToShow: data,
					time: 2000,
					preClose: (modal) => { modal.element.modal('hide'); }
				}).then(function(modal) {
				    	modal.element.modal();
				});
		});
	};
});

