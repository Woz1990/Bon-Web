var mainApp = angular.module("mainApp", ['ngRoute', 'angularModalService']);

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
			templateUrl: 'AddItembbackup.html',
			controller: 'AddItemController'
		})
		.when('/updateItem', {
			templateUrl: 'UpdateItem.html',
			controller: 'UpdateItemController'
		})
		.otherwise({
			redirectTo: '/home'
		});
});





mainApp.factory('dataSharingService', [function($rootScope){
	var sharedService = {};

	sharedService.foodItemsList = [];
	sharedService.listSet = false;
	sharedService.ItemToUpdateIndex = -1;
	sharedService.ifToUpdate = false;

	sharedService.AssignFoodItemsList = function(list){
		this.foodItemsList = list;
		this.listSet = true;
		//$rootScope.$broadcast('handleBroadcast');
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
		alert("in service add food item");
		this.foodItemsList.push(foodItem);
	}

	sharedService.DeleteFoodItem = function(index){
		this.foodItemsList.splice(index, 1);
	}

	return sharedService;

}]);




mainApp.controller('ShowFoodItemsController', function($scope, $window, $http, $location, dataSharingService, ModalService) {
	//alert("in here")
	dataSharingService.SetToUpdate(false);
	$scope.items = [/* { name: "Bitter Chocolate", meal_type: "Breakfast Lunch Dinner",
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
						expand : false}*/];
	
	if(dataSharingService.IfListSet()){
		$scope.items = dataSharingService.GetList();
	}
	else{
		var request = $http({
			    method: "get",
			    url: "http://127.0.0.1:3000/showFoodItems",
			});

			request.success(function (data) {
				
				$scope.items = [];
				items = [];
				for(i = 0; i < 20; i++){
				//alert(i + " iteration")
				if(data[i].menuImage.file.search("null") > -1) continue;
				imgProperties = GetImageProperties(null, parseInt(data[i].menuImage.imageWidth), parseInt(data[i].menuImage.imageHeight));
	            menuImgStyle = {"width" : imgProperties[0],
								"height" : imgProperties[1]};
				imgProperties = GetImageProperties(null, parseInt(data[i].firstImage.imageWidth), parseInt(data[i].firstImage.imageHeight));
	            firstImgStyle = {"width" : imgProperties[0],
								"height" : imgProperties[1]};
				secondImgStyle = thirdImgStyle = fourthImgStyle = {"width" : 90,
																	"height" : 90};
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
			    items.push({id:data[i].id, name: data[i].name, hebrew_name: data[i].hebrewName, arabic_name: data[i].arabicName ,meal_type: mealType,
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
			for(i = 0; i < items.length; i++){
				imgWidth = items[i].menu_img_style.width;
				imgHeight = items[i].menu_img_style.height;
				if (imgWidth > 90){
					ratio = imgWidth / imgHeight;
					items[i].menu_img_style.width = 90;
					items[i].menu_img_style.height = 90 / ratio;
				}
				else if(imgHeight > 90){
					ratio = imgHeight / imgWidth;
					items[i].menu_img_style.height = 90;
					items[i].menu_img_style.width = 90 / ratio;
				}
			}
			$scope.items = items;
			dataSharingService.AssignFoodItemsList($scope.items);


			}).error(function(data) {
				alert("error");
			});
		}

  $scope.showYesNo = function(item) {

  	$scope.itemToDelete = item;

    ModalService.showModal({
      templateUrl: "yesno.html",
      controller: "YesNoController",
      preClose: (modal) => { modal.element.modal('hide'); }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
      		if(result){
      			$scope.DeleteItem($scope.itemToDelete);
      		}
      });
    });
    	

};
				
	$scope.openNewTr = function(item){
		item.expand = !item.expand;
	}
	
	$scope.UpdateItem = function(item){
		dataSharingService.SetFoodItemToUpdateIndex($scope.items.indexOf(item));
		dataSharingService.SetToUpdate(true);
		$location.path("/addItem" );
	}

	$scope.DeleteItem = function(item){
		var request = $http({
		    method: "post",
		    url: "http://127.0.0.1:3000/deleteFoodItem",
		    data: JSON.stringify({
		    	itemId: item.id
			    }),
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		request.success(function (data) {
			var index = $scope.items.indexOf(item);
			$scope.items.splice(index, 1);
			dataSharingService.DeleteFoodItem(index);
			alert("akul tuv");
		}).error(function(data){
			alert("cannot delete the item");
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
        	imgWidth = 90  / ratio;
        	imgHeight = 90;
        }
        else{
        	ratio = imgWidth/imgHeight;
        	imgHeight = 90  / ratio;
        	imgWidth = 90;
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

mainApp.controller('AddItemController', function($scope, $window, $http, $location, dataSharingService) {
	$scope.foodTypes = ['Hot Drinks', 'Cold Drinks', 'Cheese', 'Sausages', 'Sauces', 'Fruits', 'Vegetables', 'Cooked Vegetables', 'Meat', 'Fish', 'Pasta & Pizza', 'Sweets', 'Cereals', 'Eggs', 'Bread', 'Pastries', 'Soups', 'Alcohol', 'Spreads'];
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
	
	$scope.dropdownButtonText = "Food Type";
	$scope.menuImageFileStyle = $scope.firstImageStyle = $scope.secondImageStyle = $scope.thirdImageStyle = $scope.fourthImageStyle = {"width" : "90px",
								"height" : "90px"};
	$scope.addUpdateButton = "Add Item";

	if(dataSharingService.IfToUpdate()){
		$scope.itemToUpdate =  dataSharingService.GetFoodItemToUpdate();
		$scope.addUpdateButtonText = " Update";
		$scope.addUpdateButtonClass = "glyphicon glyphicon-edit";

		$scope.foodName  = $scope.itemToUpdate.name;
		$scope.foodHebrewName  = $scope.itemToUpdate.hebrew_name;
		$scope.foodArabicName  = $scope.itemToUpdate.arabic_name;
		$scope.dropdownButtonText  = $scope.itemToUpdate.food_type;
		$scope.foodType = $scope.foodTypes.indexOf($scope.itemToUpdate.food_type);
/*		for(i = 0; i< $scope.itemToUpdate.meal_type.size; i++){
			if($scope.itemToUpdate.meal_type.indexOf($scope.mealTypes[i]) > -1) $scope.mealTypesBinary[i] = 1;
		}*/
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
		/*({name: data[i].name, hebrew_name: data[i].hebrewName, arabic_name: data[i].arabicName ,meal_type: mealType,
						energy: data[i].energy, protein:data[i].protein,  fatness: data[i].fatness,
						carbohydrates: data[i].carbohydrates, calcium:data[i].calcium, na:data[i].na,
						potassium:data[i].potassium,  alcohol :data[i].alcohol,  water :data[i].moisture,
						food_type: foodType, menu_image: data[i].menuImage.file, menu_img_style: menuImgStyle,
						weight : data[i].firstImage.imageWeight, img_file : data[i].firstImage.imageFile, first_img_style: firstImgStyle, height: data[i].firstImage.imageHeight, width: data[i].firstImage.imageWidth,
						weight2 : data[i].secondImage.imageWeight, img_file2 : data[i].secondImage.imageFile, second_img_style: secondImgStyle, height2: data[i].secondImage.imageHeight, width2: data[i].secondImage.imageWidth,
						weight3 : data[i].thirdImage.imageWeight, img_file3 : data[i].thirdImage.imageFile, third_img_style: thirdImgStyle, height3: data[i].thirdImage.imageHeight, width3: data[i].thirdImage.imageWidth,
						weight4 : data[i].fourthImage.imageWeight, img_file4 : data[i].fourthImage.imageFile, fourth_img_style: fourthImgStyle, height4: data[i].fourthImage.imageHeight, width4: data[i].fourthImage.imageWidth,
						expand : false});*/
	}
	else{
		$scope.addUpdateButtonText = " Add Item";
		$scope.addUpdateButtonClass = "glyphicon glyphicon-plus";
	}
	//alert($scope.item.name);


	$scope.onClickCheckbox = function(type){
		//alert("in click check box");
		var index = $scope.mealTypes.indexOf(type);
		if($scope.mealTypesBinary[index] == 0) {
			$scope.mealTypesBinary[index] = 1;
			return;
		}
		if($scope.mealTypesBinary[index] == 1) $scope.mealTypesBinary[index] = 0;
	}
	
	$scope.GetWidth = function(){
		alert($window.innerWidth);
	}
	
	$scope.FoodTypeSelected = function(type){
		$scope.foodType = $scope.foodTypes.indexOf(type);
		$scope.dropdownButtonText = type;
	}
	$scope.OpenScaler = function() {
		$window.open("crop image.html");
	}

	$scope.CheckImageProperty = function(property) {
		if (property  == "" || property  == undefined){
			$scope.additionalImagesCanProceed = false;
			return false;
		}
		var number = parseFloat(property)
		if(isNaN(number)) { $scope.additionalImagesCanProceed = false;
							return false;}
		return true;
	}

	CheckFloatNumberValidity  = function(number) {
		var number = parseFloat(number)
		if(isNaN(number)) {
			$scope.canProceed = false;
			return false;}
		return true;
	}
	
	$scope.AddItem = function() {
		$scope.canProceed = true;
		$scope.additionalImagesCanProceed = true;
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


		if ($scope.dropdownButtonText  == "Food Type"){
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
			alert($scope.brekfastCheckbox);
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
			$scope.secondImageWeightFilled = $scope.CheckImageProperty($scope.secondImageWeightModel)
			$scope.secondImageWidthFilled = $scope.CheckImageProperty($scope.secondImageWidthModel)
			$scope.secondImageHeightFilled = $scope.CheckImageProperty($scope.secondImageHeightModel)

			$scope.secondImage = {	imageFile: $scope.secondImageFile,
								        imageHeight: $scope.secondImageHeightModel,
								        imageWidth: $scope.secondImageWidthModel,
								        imageWeight: $scope.secondImageWeightModel }


			if ($scope.thirdImageFile  != "" && $scope.thirdImageFile  != undefined){

				$scope.thirdImageProceed = true;
				$scope.thirdImageWeightFilled = $scope.CheckImageProperty($scope.thirdImageWeightModel)
				$scope.thirdImageWidthFilled = $scope.CheckImageProperty($scope.thirdImageWidthModel)
				$scope.thirdImageHeightFilled = $scope.CheckImageProperty($scope.thirdImageHeightModel)

				$scope.thirdImage = {	imageFile: $scope.thirdImageFile,
								        imageHeight: $scope.thirdImageHeightModel,
								        imageWidth: $scope.thirdImageWidthModel,
								        imageWeight: $scope.thirdImageWeightModel }

				if ($scope.fourthImageFile  != "" && $scope.fourthImageFile  != undefined){
					$scope.fourthImageProceed = true;
					$scope.fourthImageWeightFilled = $scope.CheckImageProperty($scope.fourthImageWeightModel);
					$scope.fourthImageWidthFilled = $scope.CheckImageProperty($scope.fourthImageWidthModel);
					$scope.fourthImageHeightFilled = $scope.CheckImageProperty($scope.fourthImageHeightModel);

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

		if (dataSharingService.IfToUpdate()) {
			requestUrl = "http://127.0.0.1:3000/updateFoodItem";
			$scope.foodItemId = $scope.itemToUpdate.id;
		}
		else{
			requestUrl = "http://127.0.0.1:3000/addFoodItem";
			$scope.foodItemId = "0";
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
			var item = {};
			item.name = $scope.foodName;
			item.hebrew_name = $scope.foodHebrewName;
			item.arabic_name = $scope.foodArabicName;
			item.food_type = $scope.dropdownButtonText;
			item.meal_type = "";
			for(i = 0; i< $scope.mealTypes.length; i++){
				alert("in for loop");
				if($scope.mealTypesBinary[i] == 1){
					alert("meal type " + i + " equals 1");
					item.meal_type += $scope.mealTypes[i] + " ";
				}
			}
			alert(item.meal_type);
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
				$location.path("/showAllFoodItems");
			}
			else{
				dataSharingService.AddFoodItem(item);
			}
			alert("not error");
			
		}).error(function (data) {
			alert("error");
		});
	}
});
