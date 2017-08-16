var mainApp = angular.module("mainApp", ['ngRoute']);

mainApp.config(function($routeProvider) {
	$routeProvider
		.when('/home', {
			templateUrl: 'home.html',
			controller: 'LoginController'
		})
		.when('/showAllFoodItems', {
			templateUrl: 'showFoodItems.html',
			controller: 'ShowFoodItemsController'
		})
		.when('/addItem', {
			templateUrl: 'Additem backup.html',
			controller: 'AddItemController'
		})
		.otherwise({
			redirectTo: '/home'
		});
});

mainApp.controller('ShowFoodItemsController', function($scope) {

	$scope.message = "Click on the hyper link to view the students list.";
	$scope.message = 'This is Show orders screen';
				$scope.items = [ { name: "Bitter Chocolate", meal_type: "Breakfast Lunch Dinner",
									energy: 98.85, protein:18.589,  fatness: 1.016,
									carbohydrates: 2.633, calcium:10.888, na:423.359,
									potassium:206.883,  alcohol :0,  water :76.727,
									food_type: "Meat", menu_image: "img/eggplant_p7_t.png",
									weight : 107.2 , img_file : "img/eggplant_p7_t.png",
									weight2 : 0 , img_file2 : "zzz_null_image",
									weight3 : 0 , img_file3 : "zzz_null_image",
									weight4 : 0 , img_file4 : "zzz_null_image",
									expand : false}, 
									{name: "Peas And Carrot", meal_type: "Breakfast Lunch Dinner Snacks",
									energy: 98.85, protein:18.589,  fatness: 1.016,
									carbohydrates: 2.633, calcium:10.888, na:423.359,
									potassium:206.883,  alcohol :0,  water :76.727,
									food_type: "Cooked vegetables", menu_image: "img/eggplant_p7_t.png",
									weight : 107.2 , img_file : "img/eggplant_p7_t.png",
									weight2 : 0 , img_file2 : "zzz_null_image",
									weight3 : 0 , img_file3 : "zzz_null_image",
									weight4 : 0 , img_file4 : "zzz_null_image",
									expand : false}];
				
	$scope.openNewTr = function(item){
		item.expand = !item.expand;
	}

});

mainApp.controller('LoginController', function($scope, $location) {
	
	$scope.PasswordCheck = function(){

		$location.path("/showAllFoodItems" );
	};
});

mainApp.directive("fileread", [function () {
				return {
				scope: {
					fileread: "="
				},
				link: function (scope, element, attributes) {
					element.bind("change", function (changeEvent) {
						var reader = new FileReader();
						reader.onload = function (loadEvent) {
							scope.$apply(function () {
								scope.fileread = loadEvent.target.result;
							});
						}
						reader.readAsDataURL(changeEvent.target.files[0]);
					});
				}
				
				}
			}]);

mainApp.controller('AddItemController', function($scope, $window) {
	$scope.foodTypes = ['Hot Drinks', 'Cold Drinks', 'Cheese', 'Sausages', 'Sauces', 'Fruits', 'Vegetables', 'Cooked Vegetables', 'Meat', 'Fish', 'Pasta & Pizza', 'Sweets', 'Cereals', 'Eggs', 'Bread', 'Pastries', 'Soups', 'Alcohol', 'Spreads'];
	$scope.nameRequired = "";
	$scope.foodType = ""; 
	$scope.foodNameRequired = false;
	$scope.foodTypeChosen = false;
	$scope.mealTypeChosen = false;
	$scope.calciumFilled = false;
	$scope.potassiumFilled = false;
	$scope.moistureFilled = false;
	$scope.proteinFilled = false;
	$scope.carbohydratesFilled = false;
	$scope.naFilled = false;
	$scope.alcoholFilled = false;
	$scope.energyFilled = false;
	$scope.fatnessFilled = false;
	$scope.canProceed = true;
	
	$scope.dropdownButtonText = "Food Type";
	
	$scope.FoodTypeSelected = function(type){
		$scope.foodType = type;
		$scope.dropdownButtonText = type;
		$scope.foodTypeChosen = true;
	}
	$scope.OpenScaler = function() {
		$window.open("crop image.html");
	}
	
	// var CheckInputValidity = function(array) {
		// if (array[0]  == "" || array[0]  == undefined){
			// array[1] = false;
			// $scope.canProceed = false;
		// }
		// else{
			// array[1] = true;
		// }
	// }	
	
	$scope.AddItem = function() {
		$scope.canProceed = true;
		if ($scope.foodName  == "" || $scope.foodName  == undefined){
			$scope.foodNameRequired = true;
			$scope.canProceed = false;
		}
		else{
			$scope.foodNameRequired = false;
		}
		
		// CheckInputValidity([$scope.foodName, $scope.foodNameRequired]);
		
		
		if ($scope.brekfastCheckbox  == undefined && $scope.lunchCheckbox  == undefined && $scope.dinnerCheckbox  == undefined && $scope.snacksCheckbox  == undefined){
			$scope.mealTypeChosen = false;
			$scope.canProceed = false;
		}
		else{
			$scope.mealTypeChosen = true;
			// TODO
		}
		
		
		if ($scope.calciumModel  == "" || $scope.calciumModel  == undefined){
			$scope.calciumFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.calciumFilled = true;
		}
		
		
		if ($scope.potassiumModel  == "" || $scope.potassiumModel  == undefined){
			$scope.potassiumFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.potassiumFilled = true;
		}
		
		
		if ($scope.moistureModel  == "" || $scope.moistureModel  == undefined){
			$scope.moistureFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.moistureFilled = true;
		}
		
		
		if ($scope.proteinModel  == "" || $scope.proteinModel  == undefined){
			$scope.proteinFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.proteinFilled = true;
		}
		
		
		if ($scope.carbohydratesModel  == "" || $scope.carbohydratesModel  == undefined){
			$scope.carbohydratesFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.carbohydratesFilled = true;
		}
		
		
		if ($scope.naModel  == "" || $scope.naModel  == undefined){
			$scope.naFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.naFilled = true;
		}
		
		
		if ($scope.alcoholModel  == "" || $scope.alcoholModel  == undefined){
			$scope.alcoholFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.alcoholFilled = true;
		}
		
		
		if ($scope.energyModel  == "" || $scope.energyModel  == undefined){
			$scope.energyFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.energyFilled = true;
		}
		
		
		if ($scope.fatnessModel  == "" || $scope.fatnessModel  == undefined){
			$scope.fatnessFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.fatnessFilled = true;
		}
		
		
		if ($scope.menuImageFile  == "" || $scope.menuImageFile  == undefined){
			$scope.menuImageFileFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.menuImageFileFilled = true;
		}
		
		
		if ($scope.firstImageFile  == "" || $scope.firstImageFile  == undefined){
			$scope.firstImageFileFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.firstImageFileFilled = true;
		}
		
		if ($scope.firstImageWeightModel  == "" || $scope.firstImageWeightModel  == undefined){
			$scope.firstImageWeightFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.firstImageWeightFilled = true;
		}
		
		
		if ($scope.firstImageWidthModel  == "" || $scope.firstImageWidthModel  == undefined){
			$scope.firstImageWidthFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.firstImageWidthFilled = true;
		}
		
		
		if ($scope.firstImageHeightModel  == "" || $scope.firstImageHeightModel  == undefined){
			$scope.firstImageHeightFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.firstImageHeightFilled = true;
		}
	}
});