angular.module("bonApp").controller('ManageUsersController', function($scope, $window, $location, $http, $localStorage, ModalService) {
	var token = $window.localStorage['jwtToken'];
	$scope.users = [];
	$scope.usersToApprove = [];
	$scope.addedUsersValid = true;

	requestUrl = "https://192.168.1.7:3000/getUsersList";
	var request = $http({
	    method: "get",
	    url: requestUrl,
	    headers: { 
	    	'Authorization': 'Bearer ' + token,
	    	'Content-Type': 'application/x-www-form-urlencoded' }
		});
	request.success(function (data) {
		for(var i = 0; i < data.length; i++){
			$scope.users.push(data[i]);
		}
	}).error(function (data){
		alert("error");
	});

	$scope.AddNew = function(){
		$scope.usersToApprove.push({'first_name':'','last_name':'','email':'', 'password':'',
															'approved':false, 'emailValid':true});
	}

	$scope.Approve = function(){
		for(var i = 0; i < $scope.usersToApprove.length; i++){
			if($scope.usersToApprove[i].emailValid == false){
				return;
			}
		}

		requestUrl = "https://192.168.1.7:3000/addUsers";
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify({
	    		users: $scope.usersToApprove
			    }),
		    headers: { 
		    	'Authorization': 'Bearer ' + token,
		    	'Content-Type': 'application/x-www-form-urlencoded' }
			});
		request.success(function (data) {
			alert("success");
			for(var i = 0; i < $scope.usersToApprove.length; i++){
				$scope.usersToApprove[i].password = '';
				$scope.users.push($scope.usersToApprove[i]);
			}
			$scope.usersToApprove.length = 0;
		}).error(function (data){
			alert("error");
			if(data.length > 0){
				for(var i = 0; i < data.length; i++){
					$scope.users.push(data[i]);
					$scope.RemoveUserToApprove(data[i]);
				}
			}
		});
	}

	$scope.CheckIfEmailValid = function(user){
		for(var i = 0; i < $scope.users.length; i++){
			if($scope.users[i].email == user.email){
				user.emailValid = false;
				return;
			}
		}
		for(var i = 0; i < $scope.usersToApprove.length; i++){
			if($scope.usersToApprove[i] == user) continue;
			if($scope.usersToApprove[i].email == user.email){
				user.emailValid = false;
				return;
			}
		}
		user.emailValid = true;
	}

	$scope.openQuestionWindow = function(user) {

	    ModalService.showModal({
	      templateUrl: "templates/QuestionWindow.html",
	      controller: "ModalWindowController",
	      title: "",
	      textToShow: "Are sure you want to remove "+user.first_name+" "+user.last_name+" " +user.email + "?",
	      time: 8000,
	      preClose: (modal) => { modal.element.modal('hide'); }
	    }).then(function(modal) {
	      modal.element.modal();
	      modal.close.then(function(result) {
	      		//If user answered Yes the item is to be deleted
	      		if(result){
	      			$scope.RemoveUser(user);
	      		}
	      });
	    });
	}

	$scope.RemoveUser = function(user){

		requestUrl = "https://192.168.1.7:3000/RemoveUser";
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify({
	    		email: user.email
			    }),
		    headers: { 
		    	'Authorization': 'Bearer ' + token,
		    	'Content-Type': 'application/x-www-form-urlencoded' }
			});
		request.success(function (data) {
			var index = $scope.users.indexOf(user);
  			$scope.users.splice(index, 1);
  			$scope.CheckAllEmailsValidity();
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
	}

		$scope.RemoveUserToApprove = function(user){
			for(var i = 0; i <$scope.usersToApprove.length; i++){
				if(user.email==$scope.usersToApprove[i].email){
					$scope.usersToApprove.splice(i, 1); 
					break;
				}
			}
			$scope.CheckAllEmailsValidity();
		}

		$scope.CheckAllEmailsValidity = function(){
			for(var i = 0; i <$scope.usersToApprove.length; i++){
				$scope.CheckIfEmailValid($scope.usersToApprove[i]);
			}
		}

});
 
