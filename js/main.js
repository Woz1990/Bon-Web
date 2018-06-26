var mainApp = angular.module("bonApp", ['ngRoute', 'ngStorage', 'angularModalService', 'pasvaz.bindonce']);

mainApp.config(function($routeProvider) {
	$routeProvider

		.when('/home', {
			templateUrl: 'templates/showFoodItems.html',
			controller: 'ShowFoodItemsController'
		})
		.when('/addUpdateItem', {
			templateUrl: 'templates/AddUpdateItem.html',
			controller: 'AddUpdateItemController'
		})
		.otherwise({
			redirectTo: '/home'
		});
});


//The purpose of this factory is to share data between different controllers
mainApp.factory('dataSharingService', [function($rootScope){
	var sharedService = {};

	sharedService.foodItemsList = [];
	sharedService.listSet = false;
	sharedService.ItemToUpdateIndex = -1;
	sharedService.ifToUpdate = false;

	sharedService.openWindows = [];


	sharedService.AssignFoodItemsList = function(list){
		this.foodItemsList = list;
		this.listSet = true;
	}

	sharedService.GetList = function(){
		return this.foodItemsList;
	}

	sharedService.IfListSet = function(){
		return this.listSet;
	}

	sharedService.GetFoodItemToUpdate = function(){
		return this.foodItemsList[this.ItemToUpdateIndex];
	}

	sharedService.UpdateFoodItem = function(foodItem){
		for(var key in foodItem){
		    this.foodItemsList[this.ItemToUpdateIndex][key] = foodItem[key];
		}
	}

	sharedService.SetFoodItemToUpdateIndex = function(index){
		this.ItemToUpdateIndex = index;
	}

	sharedService.SetToUpdate = function(ifToUpdate){
		this.ifToUpdate = ifToUpdate;
	}

	sharedService.IfToUpdate = function(){
		return this.ifToUpdate;
	}

	sharedService.AddFoodItem = function(foodItem){
		index = this.foodItemsList.length;
		defaultImageStyle = {"width" : 80,
								"height" : 80};
		this.foodItemsList.push({id:"foodItem.id", name: "foodItem.name", hebrew_name: "foodItem.hebrew_name", 
			arabic_name: "foodItem.arabic_name" ,meal_type: "foodItem.meal_type", energy: "foodItem.energy", 
			protein:"foodItem.protein",  fatness: "foodItem.fatness", carbohydrates: "foodItem.carbohydrates", 
			calcium:"foodItem.calcium", na:"foodItem.na", potassium:"foodItem.potassium",  alcohol :"foodItem.alcohol",  
			moisture :"foodItem.moisture", food_type: "foodItem.food_type", menu_image: "foodItem.menu_image", 
			menu_img_style: defaultImageStyle,
			weight : "foodItem.weight", img_file : "this.foodItemsList[2].img_file", first_img_style: defaultImageStyle,  height: "foodItem.height", width: "foodItem.weight",
			weight2 : "foodItem.weight2", img_file2 : "foodItem.img_file2", second_img_style: defaultImageStyle, height2: "foodItem.height2", width2: "foodItem.weight2",
			weight3 : "foodItem.weight3", img_file3 : "foodItem.img_file3", third_img_style: defaultImageStyle, height3: "foodItem.height3", width3: "foodItem.weight3",
			weight4 : "foodItem.weight4", img_file4 : "foodItem.img_file4", fourth_img_style: defaultImageStyle, height4: "foodItem.height4", width4: "foodItem.weight4",
			expand : false});
		for(var key in foodItem){
		    this.foodItemsList[index][key] = foodItem[key];
		}

	}

	sharedService.DeleteFoodItem = function(index){
		this.foodItemsList.splice(index, 1);
	}

	sharedService.AddOpenWindow = function(window){
		this.openWindows.push(window);
	}

	sharedService.CloseAllOpenWindows = function(){
		for(i = 0; i < this.openWindows.length; i++){
			this.openWindows[i].close();
		}
		this.openWindows = [];
	}

	sharedService.GetImageProperties = function(image, imgWidth, imgHeight){ 
		if(image != null){
			var img = new Image();
			img.src = image;			
			img.onload = function () {}
			var imgHeight = img.height;
	        var imgWidth = img.width;
    	}

      if(imgHeight > imgWidth){
      	ratio = imgHeight/imgWidth;
      	imgWidth = $scope.imageWidthHeightDefault  / ratio;
      	imgHeight = $scope.imageWidthHeightDefault;
      }
      else{
      	ratio = imgWidth/imgHeight;
      	imgHeight = $scope.imageWidthHeightDefault  / ratio;
      	imgWidth = $scope.imageWidthHeightDefault;
      }
      return [imgWidth, imgHeight];
	}

	return sharedService;

}]);

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

