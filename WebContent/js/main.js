var mainApp = angular.module("mainApp", ['ngRoute', 'angularModalService']);

mainApp.config(function($routeProvider) {
	$routeProvider
		.when('/home', {
			templateUrl: 'templates/home.html',
			controller: 'LoginController'
		})
		.when('/showAllFoodItems', {
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
		this.foodItemsList[this.ItemToUpdateIndex] = foodItem;
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
		this.foodItemsList.push(foodItem);
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

	return sharedService;

}]);




mainApp.controller('ShowFoodItemsController', function($scope, $window, $http, $location, dataSharingService, ModalService) {
	dataSharingService.SetToUpdate(false);
	dataSharingService.CloseAllOpenWindows();
	$scope.items = [];
	$scope.imageWidthHeightDefault = 90;
	
	if(dataSharingService.IfListSet()){
		$scope.items = dataSharingService.GetList();
	}
	else{
		var request = $http({
			    method: "get",
			    url: "http://127.0.0.1:3000/showFoodItems",
			});

			request.success(function (data) {
				//Populating items list which will be then showed to the user 
				$scope.items = [];
				items = [];
				for(i = 0; i < data.length; i++){
				if(data[i].menuImage.file.search("null") > -1) continue;
				imgProperties = GetImageProperties(null, parseInt(data[i].menuImage.imageWidth), parseInt(data[i].menuImage.imageHeight));
	            menuImgStyle = {"width" : imgProperties[0],
								"height" : imgProperties[1]};
				imgProperties = GetImageProperties(null, parseInt(data[i].firstImage.imageWidth), parseInt(data[i].firstImage.imageHeight));
	            firstImgStyle = {"width" : imgProperties[0],
								"height" : imgProperties[1]};

				secondImgStyle = thirdImgStyle = fourthImgStyle = {"width" : $scope.imageWidthHeightDefault,
																	"height" : $scope.imageWidthHeightDefault};

				if(data[i].secondImage.imageFile != "null"){
					imgProperties = GetImageProperties(null, parseInt(data[i].secondImage.imageWidth), parseInt(data[i].secondImage.imageHeight));
	            	secondImgStyle = {"width" : imgProperties[0],
									"height" : imgProperties[1]};

					if(data[i].thirdImage.imageFile != "null"){
						imgProperties = GetImageProperties(null, parseInt(data[i].thirdImage.imageWidth), parseInt(data[i].thirdImage.imageHeight));
		            	thirdImgStyle = {"width" : imgProperties[0],
										"height" : imgProperties[1]};

						if(data[i].fourthImage.imageFile != "null"){
							imgProperties = GetImageProperties(null, parseInt(data[i].fourthImage.imageWidth), parseInt(data[i].fourthImage.imageHeight));
			            	fourthImgStyle = {"width" : imgProperties[0],
											"height" : imgProperties[1]};
						}
					}
				}

				mealType = "";
				if(data[i].breakfast == 1){ mealType += "Breakfast ";}
				if(data[i].lunch == 1){ mealType += "Lunch ";}
				if(data[i].dinner == 1){ mealType += "Dinner ";}
				if(data[i].snacks == 1){ mealType += "Snacks";}

				foodType = GetFoodType(parseInt(data[i].category));
		    	$scope.items.push({id:data[i].id, name: data[i].name, hebrew_name: data[i].hebrewName, arabic_name: data[i].arabicName ,meal_type: mealType,
						energy: data[i].energy, protein:data[i].protein,  fatness: data[i].fatness,
						carbohydrates: data[i].carbohydrates, calcium:data[i].calcium, na:data[i].na,
						potassium:data[i].potassium,  alcohol :data[i].alcohol,  moisture :data[i].moisture,
						food_type: foodType, menu_image: data[i].menuImage.file, menu_img_style: menuImgStyle,
						weight : data[i].firstImage.imageWeight, img_file : data[i].firstImage.imageFile, first_img_style: firstImgStyle, height: data[i].firstImage.imageHeight, width: data[i].firstImage.imageWidth,
						weight2 : data[i].secondImage.imageWeight, img_file2 : data[i].secondImage.imageFile, second_img_style: secondImgStyle, height2: data[i].secondImage.imageHeight, width2: data[i].secondImage.imageWidth,
						weight3 : data[i].thirdImage.imageWeight, img_file3 : data[i].thirdImage.imageFile, third_img_style: thirdImgStyle, height3: data[i].thirdImage.imageHeight, width3: data[i].thirdImage.imageWidth,
						weight4 : data[i].fourthImage.imageWeight, img_file4 : data[i].fourthImage.imageFile, fourth_img_style: fourthImgStyle, height4: data[i].fourthImage.imageHeight, width4: data[i].fourthImage.imageWidth,
						expand : false});
			}

			dataSharingService.AssignFoodItemsList($scope.items);


			}).error(function(data) {
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

  $scope.openQuestionWindow = function(item) {

  	$scope.itemToDelete = item;

    ModalService.showModal({
      templateUrl: "templates/QuestionWindow.html",
      controller: "ModalWindowController",
      title: "",
      textToShow: "Are sure you want to delete "+item.name+"?",
      time: 8000,
      preClose: (modal) => { modal.element.modal('hide'); }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
      		//If user answered Yes the item is to be deleted
      		if(result){
      			$scope.DeleteItem($scope.itemToDelete);
      		}
      });
    });
    	

	};
				
	$scope.ExpandContract = function(item){
		item.expand = !item.expand;
	}
	
	$scope.UpdateItem = function(item){
		dataSharingService.SetFoodItemToUpdateIndex($scope.items.indexOf(item));
		dataSharingService.SetToUpdate(true);
		$location.path("/addUpdateItem" );
	}

	$scope.DeleteItem = function(item){
		var request = $http({
		    method: "post",
		    url: "http://127.0.0.1:3000/deleteFoodItem",
		    data: JSON.stringify({
		    	itemId: item.id }),
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		request.success(function (data) {
			var index = $scope.items.indexOf(item);
			$scope.items.splice(index, 1);
			dataSharingService.DeleteFoodItem(index);
			ModalService.showModal({
		      templateUrl: "templates/requestResultWindow.html",
		      controller: "ModalWindowController",
		      title: "Success",
		      textToShow: "Successfully deleted "+item.name,
		      time: 1500,
		      preClose: (modal) => { modal.element.modal('hide'); }
		    }).then(function(modal) {
			    	modal.element.modal();
		    });
		}).error(function(data){
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

	GetImageProperties = function(image, imgWidth, imgHeight){ 
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

	GetFoodType  = function(typeNumber){ 
		switch(typeNumber){
			case 0: return "Milk Products";
			case 1: return "Hot Drinks";
			case 2: return "Cold Drinks";
			case 3: return "Cheese";
			case 4: return "Sausages";
			case 5: return "Sauces";
			case 6: return "Fruits";
			case 7: return "Fresh Vegetables";
			case 8: return "Cooked Vegetables";
			case 9: return "Meat";
			case 10: return "Fish";
			case 11: return "Pasta Pizza";
			case 12: return "Sweets";
			case 13: return "Cereals";
			case 14: return "Eggs";
			case 15: return "Bread";
			case 16: return "Pastries";
			case 17: return "Soups";
			case 18: return "Alcohol";
			case 19: return "Spreads";
		}
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

mainApp.controller('AddUpdateItemController', function($scope, $window, $http, $location, $timeout, dataSharingService, ModalService) {
	$scope.foodTypes = ["Milk Products", 'Hot Drinks', 'Cold Drinks', 'Cheese', 'Sausages', 'Sauces', 'Fruits', 'Vegetables', 'Cooked Vegetables', 'Meat', 'Fish', 'Pasta & Pizza', 'Sweets', 'Cereals', 'Eggs', 'Bread', 'Pastries', 'Soups', 'Alcohol', 'Spreads'];
	$scope.mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
	$scope.mealTypesBinary = [0, 0, 0, 0];
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
	
	$scope.foodTypeButtonText = "Food Type";
	$scope.menuImageFileStyle = $scope.firstImageStyle = $scope.secondImageStyle = $scope.thirdImageStyle = 
								$scope.fourthImageStyle = {"width" : "90px", "height" : "90px"};
	$scope.addUpdateButton = "Add Item";

	if(dataSharingService.IfToUpdate()){//Update item mode
										//Populating all the fields
		$scope.itemToUpdate =  dataSharingService.GetFoodItemToUpdate();
		$scope.addUpdateButtonText = " Update";
		$scope.addUpdateButtonClass = "glyphicon glyphicon-edit";

		$scope.foodName  = $scope.itemToUpdate.name;
		$scope.foodHebrewName  = $scope.itemToUpdate.hebrew_name;
		$scope.foodArabicName  = $scope.itemToUpdate.arabic_name;
		$scope.foodTypeButtonText  = $scope.itemToUpdate.food_type;
		$scope.foodType = $scope.foodTypes.indexOf($scope.itemToUpdate.food_type);

		if($scope.itemToUpdate.meal_type.indexOf("Breakfast") > -1){
			$scope.mealTypesBinary[0] = 1;
			$scope.brekfastCheckbox = true;
		}
		if($scope.itemToUpdate.meal_type.indexOf("Lunch") > -1){
			$scope.mealTypesBinary[1] = 1;
			$scope.lunchCheckbox = true;
		}
		if($scope.itemToUpdate.meal_type.indexOf("Dinner") > -1){
			$scope.mealTypesBinary[2] = 1;
			$scope.dinnerCheckbox = true;
		}
		if($scope.itemToUpdate.meal_type.indexOf("Snacks") > -1){
			$scope.mealTypesBinary[3] = 1;
			$scope.snacksCheckbox = true;
		}
		$scope.calciumModel  = $scope.itemToUpdate.calcium;
		$scope.potassiumModel  = $scope.itemToUpdate.potassium;
		$scope.moistureModel  = $scope.itemToUpdate.moisture;
		$scope.proteinModel  = $scope.itemToUpdate.protein;
		$scope.carbohydratesModel  = $scope.itemToUpdate.carbohydrates;
		$scope.naModel  = $scope.itemToUpdate.na;
		$scope.alcoholModel  = $scope.itemToUpdate.alcohol;
		$scope.energyModel  = $scope.itemToUpdate.energy;
		$scope.fatnessModel  = $scope.itemToUpdate.fatness;
		$scope.menuImageFile  = $scope.itemToUpdate.menu_image;
		$scope.menuImageFileStyle = $scope.itemToUpdate.menu_img_style;
		$scope.firstImageFile = $scope.itemToUpdate.img_file;
		$scope.firstImageWeightModel = $scope.itemToUpdate.weight;
		$scope.firstImageWidthModel = $scope.itemToUpdate.width;
		$scope.firstImageHeightModel = $scope.itemToUpdate.height;
		$scope.firstImageStyle = $scope.itemToUpdate.first_img_style;
		if($scope.itemToUpdate.img_file2 != "null"){
			$scope.secondImageFile = $scope.itemToUpdate.img_file2;
			$scope.secondImageWeightModel = $scope.itemToUpdate.weight2;
			$scope.secondImageWidthModel = $scope.itemToUpdate.width2;
			$scope.secondImageHeightModel = $scope.itemToUpdate.height2;
			$scope.secondImageStyle = $scope.itemToUpdate.second_img_style;
			if($scope.itemToUpdate.img_file3 != "null"){
				$scope.thirdImageFile = $scope.itemToUpdate.img_file3;
				$scope.thirdImageWeightModel = $scope.itemToUpdate.weight3;
				$scope.thirdImageWidthModel = $scope.itemToUpdate.width3;
				$scope.thirdImageHeightModel = $scope.itemToUpdate.height3;
				$scope.thirdImageStyle = $scope.itemToUpdate.third_img_style;

				if($scope.itemToUpdate.img_file4 != "null"){
							$scope.fourthImageFile = $scope.itemToUpdate.img_file4;
							$scope.fourthImageWeightModel = $scope.itemToUpdate.weight4;
							$scope.fourthImageWidthModel = $scope.itemToUpdate.width4;
							$scope.fourthImageHeightModel = $scope.itemToUpdate.height4;
							$scope.fourthImageStyle = $scope.itemToUpdate.fourth_img_style;
				}
			}
		}
	} else{//Add item mode
		$scope.addUpdateButtonText = " Add Item";
		$scope.addUpdateButtonClass = "glyphicon glyphicon-plus";
	}

	$scope.GetWidth = function(){
		alert($window.innerWidth);
	}

	$scope.onClickMealType = function(type){
		var index = $scope.mealTypes.indexOf(type);
		if($scope.mealTypesBinary[index] == 0) {
			$scope.mealTypesBinary[index] = 1;
			return;
		}
		if($scope.mealTypesBinary[index] == 1) $scope.mealTypesBinary[index] = 0;
	}
	
	$scope.FoodTypeSelected = function(type){
		$scope.foodType = $scope.foodTypes.indexOf(type);
		$scope.foodTypeButtonText = type;
	}
	$scope.OpenScaler = function() { 
		$window.$scope = $scope;
		var newWindow = $window.open("templates/crop image.html");
		dataSharingService.AddOpenWindow(newWindow);
	}

	TestFunction = function(data) {
		alert(data);
	}

	CheckImageProperty = function(property) {
		if (property  == "" || property  == undefined){
			$scope.additionalImagesCanProceed = false;
			return false;
		}
		var number = parseFloat(property)
		if(isNaN(number)) { 
			$scope.additionalImagesCanProceed = false;
			return false;
		}
		return true;
	}

	//This function checks if nutritional and first image values are valid
	CheckFloatNumberValidity  = function(number) {
		var number = parseFloat(number)
		if(isNaN(number)) {
			$scope.canProceed = false;
			return false;}
		return true;
	}
	
	$scope.AddUpdateItem = function() {
		$scope.canProceed = true;//This variable which tells if all the main fields are fullfiled and if fullfilled values are valid
		$scope.additionalImagesCanProceed = true;//In case more than one image were uploaded this variable tells if
												 //all needed fields were properly fullfilled
		if ($scope.foodName  == "" || $scope.foodName  == undefined){
			$scope.foodNameRequired = true;
			$scope.canProceed = false;
		}
		else{
			$scope.foodNameRequired = false;
		}

		if ($scope.foodHebrewName  == "" || $scope.foodHebrewName  == undefined){
			$scope.foodHebrewNameRequired = true;
			$scope.canProceed = false;
		}
		else{
			$scope.foodHebrewNameRequired = false;
		}

		if ($scope.foodArabicName  == "" || $scope.foodArabicName  == undefined){
			$scope.foodArabicNameRequired = true;
			$scope.canProceed = false;
		}
		else{
			$scope.foodArabicNameRequired = false;
		}


		if ($scope.foodTypeButtonText  == "Food Type"){
			$scope.foodTypeChosen = false;
			$scope.canProceed = false;
		}
		else{
			$scope.foodTypeChosen = true;
		}
		
		
		if ($scope.brekfastCheckbox  == undefined && $scope.lunchCheckbox  == undefined && $scope.dinnerCheckbox  == undefined && $scope.snacksCheckbox  == undefined){
			$scope.mealTypeChosen = false;
			$scope.canProceed = false;
		}
		else{
			$scope.mealTypeChosen = true;
		}
		
		
		if ($scope.calciumModel  == "" || $scope.calciumModel  == undefined){
			$scope.calciumFilled = false;
			$scope.canProceed = false;
		}
		else{

			$scope.calciumFilled = CheckFloatNumberValidity($scope.calciumModel);
		}
		
		
		if ($scope.potassiumModel  == "" || $scope.potassiumModel  == undefined){
			$scope.potassiumFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.potassiumFilled = CheckFloatNumberValidity($scope.potassiumModel);
		}
		
		
		if ($scope.moistureModel  == "" || $scope.moistureModel  == undefined){
			$scope.moistureFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.moistureFilled = CheckFloatNumberValidity($scope.moistureModel);
		}
		
		
		if ($scope.proteinModel  == "" || $scope.proteinModel  == undefined){
			$scope.proteinFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.proteinFilled = CheckFloatNumberValidity($scope.proteinModel);
		}
		
		
		if ($scope.carbohydratesModel  == "" || $scope.carbohydratesModel  == undefined){
			$scope.carbohydratesFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.carbohydratesFilled  = CheckFloatNumberValidity($scope.carbohydratesModel);
		}
		
		
		if ($scope.naModel  == "" || $scope.naModel  == undefined){
			$scope.naFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.naFilled  = CheckFloatNumberValidity($scope.naModel);
		}
		
		
		if ($scope.alcoholModel  == "" || $scope.alcoholModel  == undefined){
			$scope.alcoholFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.alcoholFilled  = CheckFloatNumberValidity($scope.alcoholModel);
		}
		
		
		if ($scope.energyModel  == "" || $scope.energyModel  == undefined){
			$scope.energyFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.energyFilled = CheckFloatNumberValidity($scope.energyModel);
		}
		
		
		if ($scope.fatnessModel  == "" || $scope.fatnessModel  == undefined){
			$scope.fatnessFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.fatnessFilled = CheckFloatNumberValidity($scope.fatnessModel);
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
			$scope.firstImageWeightFilled = CheckFloatNumberValidity($scope.firstImageWeightModel);
		}
		
		
		if ($scope.firstImageWidthModel  == "" || $scope.firstImageWidthModel  == undefined){
			$scope.firstImageWidthFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.firstImageWidthFilled = CheckFloatNumberValidity($scope.firstImageWidthModel);
		}
		
		
		if ($scope.firstImageHeightModel  == "" || $scope.firstImageHeightModel  == undefined){
			$scope.firstImageHeightFilled = false;
			$scope.canProceed = false;
		}
		else{
			$scope.firstImageHeightFilled = CheckFloatNumberValidity($scope.firstImageHeightModel);
		}

		$scope.firstImage = {	imageFile: $scope.firstImageFile,
						        imageHeight: $scope.firstImageHeightModel,
						        imageWidth: $scope.firstImageWidthModel,
						        imageWeight: $scope.firstImageWeightModel }

		if ($scope.secondImageFile  != "" && $scope.secondImageFile  != undefined){

			$scope.secondImageProceed = true;
			$scope.secondImageWeightFilled = CheckImageProperty($scope.secondImageWeightModel)
			$scope.secondImageWidthFilled = CheckImageProperty($scope.secondImageWidthModel)
			$scope.secondImageHeightFilled = CheckImageProperty($scope.secondImageHeightModel)

			$scope.secondImage = {	imageFile: $scope.secondImageFile,
								        imageHeight: $scope.secondImageHeightModel,
								        imageWidth: $scope.secondImageWidthModel,
								        imageWeight: $scope.secondImageWeightModel }


			if ($scope.thirdImageFile  != "" && $scope.thirdImageFile  != undefined){

				$scope.thirdImageProceed = true;
				$scope.thirdImageWeightFilled = CheckImageProperty($scope.thirdImageWeightModel)
				$scope.thirdImageWidthFilled = CheckImageProperty($scope.thirdImageWidthModel)
				$scope.thirdImageHeightFilled = CheckImageProperty($scope.thirdImageHeightModel)

				$scope.thirdImage = {	imageFile: $scope.thirdImageFile,
								        imageHeight: $scope.thirdImageHeightModel,
								        imageWidth: $scope.thirdImageWidthModel,
								        imageWeight: $scope.thirdImageWeightModel }

				if ($scope.fourthImageFile  != "" && $scope.fourthImageFile  != undefined){
					$scope.fourthImageProceed = true;
					$scope.fourthImageWeightFilled = CheckImageProperty($scope.fourthImageWeightModel);
					$scope.fourthImageWidthFilled = CheckImageProperty($scope.fourthImageWidthModel);
					$scope.fourthImageHeightFilled = CheckImageProperty($scope.fourthImageHeightModel);

					$scope.fourthImage = {	imageFile: $scope.fourthImageFile,
								        imageHeight: $scope.fourthImageHeightModel,
								        imageWidth: $scope.fourthImageWidthModel,
								        imageWeight: $scope.fourthImageWeightModel };

				}
				else {$scope.fourthImageProceed = false;
					  $scope.fourthImage = "null";}


			}
			else{$scope.thirdImageProceed = false;
			 	 $scope.fourthImageProceed = false;
			  	 $scope.thirdImage = "null";
				 $scope.fourthImage = "null";}

		}
		else{$scope.secondImageProceed = false;
			 $scope.thirdImageProceed = false;
			 $scope.fourthImageProceed = false;
			 $scope.secondImage = "null";
			 $scope.thirdImage = "null";
			 $scope.fourthImage = "null";
		}

		if($scope.canProceed == false || $scope.additionalImagesCanProceed == false){
			return;
		}

		if (dataSharingService.IfToUpdate()) {//Update item mode
			requestUrl = "http://127.0.0.1:3000/updateFoodItem";
			$scope.foodItemId = $scope.itemToUpdate.id;
			var messageToShow = "Item was updated successfully"
		}
		else{//Add item mode
			requestUrl = "http://127.0.0.1:3000/addFoodItem";
			$scope.foodItemId = "0";
			var messageToShow = "Item was added successfully"
		}
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify({
	    		itemId: $scope.foodItemId,
		        name: $scope.foodName,
				hebrewName: $scope.foodHebrewName,	
				arabicName: $scope.foodArabicName,	        
		        foodType: $scope.foodType,
		        mealType: $scope.mealTypesBinary,
		        calcium: $scope.calciumModel,
		        potassium: $scope.potassiumModel,
		        moisture: $scope.moistureModel,
		        protein: $scope.proteinModel,
		        carbohydrates: $scope.carbohydratesModel,
		        na: $scope.naModel,
		        alcohol: $scope.alcoholModel,
		        energy: $scope.energyModel,
		        fatness: $scope.fatnessModel,
		        menuImageFile: $scope.menuImageFile,
		        firstImage: $scope.firstImage,
		    	secondImage: $scope.secondImage,
		    	thirdImage: $scope.thirdImage,
		    	fourthImage: $scope.fourthImage,
			    }),
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		 /*Check whether the HTTP Request is successful or not. */
		request.success(function (data) {
			//Creating new item on the client side
			//Then it will be added 
			//Or it will replace the existing item
			//Depending on the mode
			var item = {};
			item.name = $scope.foodName;
			item.hebrew_name = $scope.foodHebrewName;
			item.arabic_name = $scope.foodArabicName;
			item.food_type = $scope.foodTypeButtonText;
			item.meal_type = "";
			for(i = 0; i< $scope.mealTypes.length; i++){
				if($scope.mealTypesBinary[i] == 1){
					item.meal_type += $scope.mealTypes[i] + " ";
				}
			}
			item.calcium = $scope.calciumModel;
			item.potassium = $scope.potassiumModel;
			item.moisture = $scope.moistureModel;
			item.protein = $scope.proteinModel;
			item.carbohydrates = $scope.carbohydratesModel;
			item.na = $scope.naModel;
			item.alcohol = $scope.alcoholModel;
			item.energy = $scope.energyModel;
			item.fatness = $scope.fatnessModel;
			item.menu_image = $scope.menuImageFile;
			item.menu_img_style = $scope.menuImageFileStyle;
			item.img_file = $scope.firstImageFile;
			item.weight = $scope.firstImageWeightModel;
			item.width = $scope.firstImageWidthModel;
			item.height = $scope.firstImageHeightModel;
			item.first_img_style = $scope.firstImageStyle;
			item.img_file2 = $scope.secondImageFile;
			item.weight2 = $scope.secondImageWeightModel;
			item.width2 = $scope.secondImageWidthModel;
			item.height2 = $scope.secondImageHeightModel;
			item.second_img_style = $scope.secondImageStyle;
			if ($scope.secondImageFile  == "" || $scope.secondImageFile  == undefined){
				item.weight2 = item.width2 = item.height2 = -1;
			}
			item.img_file3 = $scope.thirdImageFile;
			item.weight3 = $scope.thirdImageWeightModel;
			item.width3 = $scope.thirdImageWidthModel;
			item.height3 = $scope.thirdImageHeightModel;
			item.third_img_style = $scope.thirdImageStyle;
			if ($scope.thirdImageFile  == "" || $scope.thirdImageFile  == undefined){
				item.weight3 = item.width3 = item.height3 = -1;
			}
			item.img_file4 = $scope.fourthImageFile;
			item.weight4 = $scope.fourthImageWeightModel;
			item.width4 = $scope.fourthImageWidthModel;
			item.height4 = $scope.fourthImageHeightModel;
			item.fourth_img_style = $scope.fourthImageStyle;
			if ($scope.thirdImageFile  == "" || $scope.thirdImageFile  == undefined){
				item.weight4 = item.width4 = item.height4 = -1;
			}
			if(dataSharingService.IfToUpdate()){
				dataSharingService.UpdateFoodItem(item);
				$timeout(function () {
				      $location.path("/showAllFoodItems");
				  }, 2500);
			}
			else{
				dataSharingService.AddFoodItem(item);
			}
			ModalService.showModal({
		      templateUrl: "templates/requestResultWindow.html",
		      controller: "ModalWindowController",
		      title: "Success",
		      textToShow: messageToShow,
		      time: 1500,
		      preClose: (modal) => { modal.element.modal('hide'); }
		    }).then(function(modal) {
				    	modal.element.modal();
			    });
			
		}).error(function (data) {
			ModalService.showModal({
		      templateUrl: "templates/requestResultWindow.html",
		      controller: "ModalWindowController",
		      title: "Error",
		      textToShow: data,
		      time: 2500,
		      preClose: (modal) => { modal.element.modal('hide'); }
		    }).then(function(modal) {
				    	modal.element.modal();
			    });
		});
	}
});
