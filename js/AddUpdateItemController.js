angular.module("bonApp").controller('AddUpdateItemController', function($scope, $window, $http, $location, $timeout, dataSharingService, ModalService) {
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
	$scope.request_status = "";

	$scope.imageWidthHeightDefault = 80;
	
	$scope.foodTypeButtonText = "Food Type";
	$scope.menuImageFileStyle = $scope.firstImageStyle = $scope.secondImageStyle = $scope.thirdImageStyle = 
								$scope.fourthImageStyle = {"width" : "90px", "height" : "90px"};
	$scope.addUpdateButton = "Add Item";
	if(dataSharingService.IfToUpdate()){//Update item mode
										//Populating all the fields
		$scope.itemToUpdate =  dataSharingService.GetFoodItemToUpdate();
		/*for(var key in $scope.itemToUpdate){
			alert(key + ":"+$scope.itemToUpdate[key]);
		}*/
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
		if($scope.itemToUpdate.img_file2.search("null") == -1){
			$scope.secondImageFile = $scope.itemToUpdate.img_file2;
			$scope.secondImageWeightModel = $scope.itemToUpdate.weight2;
			$scope.secondImageWidthModel = $scope.itemToUpdate.width2;
			$scope.secondImageHeightModel = $scope.itemToUpdate.height2;
			$scope.secondImageStyle = $scope.itemToUpdate.second_img_style;
			if($scope.itemToUpdate.img_file3.search("null") == -1){
				$scope.thirdImageFile = $scope.itemToUpdate.img_file3;
				$scope.thirdImageWeightModel = $scope.itemToUpdate.weight3;
				$scope.thirdImageWidthModel = $scope.itemToUpdate.width3;
				$scope.thirdImageHeightModel = $scope.itemToUpdate.height3;
				$scope.thirdImageStyle = $scope.itemToUpdate.third_img_style;

				if($scope.itemToUpdate.img_file4.search("null") == -1){
							$scope.fourthImageFile = $scope.itemToUpdate.img_file4;
							$scope.fourthImageWeightModel = $scope.itemToUpdate.weight4;
							$scope.fourthImageWidthModel = $scope.itemToUpdate.width4;
							$scope.fourthImageHeightModel = $scope.itemToUpdate.height4;
							$scope.fourthImageStyle = $scope.itemToUpdate.fourth_img_style;
				}
				else $scope.itemToUpdate.img_file4 = undefined;
			}
			else { 
				$scope.itemToUpdate.img_file3 = undefined; 
				$scope.itemToUpdate.img_file4 = undefined;
			}
		}
		else{
			$scope.itemToUpdate.img_file2 = undefined;
			$scope.itemToUpdate.img_file3 = undefined;
			$scope.itemToUpdate.img_file4 = undefined;
		}
	} else{//Add item mode
		$scope.addUpdateButtonText = " Add Item";
		$scope.addUpdateButtonClass = "glyphicon glyphicon-plus";
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

	CheckImageProperty = function(property) {
		if (property  == "" || property  == undefined){
			$scope.additionalImagesCanProceed = false;
			return [property, false];
		}
		var number = parseFloat(property)
		if(isNaN(number)) { 
			$scope.additionalImagesCanProceed = false;
			return [property, false];
		}
		if (number < 0){ 
			$scope.additionalImagesCanProceed = false;
			return [number, false];}

		return [number, true];
	}

	//This function checks if nutritional and first image values are valid
	CheckFloatNumberValidity  = function(number) {
		var number = parseFloat(number)
		if(isNaN(number)) {
			//alert("first");
			$scope.canProceed = false;
			return [number, false];}
		if(number == 0){
			//alert("second");
			return [number, true];
		}
		if (number < 0){ 
			//alert("third");
			$scope.canProceed = false;
			return [number, false];
		}
		//alert("fourth");
		return [number, true];
	}

	CheckFloatNumberValidity2  = function(number) {
		if (number  == "" || number  == undefined){
			$scope.canProceed = false;
			return ["", false];
		}
		var number = parseFloat(number)
		if(isNaN(number)) {
			//alert("first");
			$scope.canProceed = false;
			return [number, false];}
		if(number == 0){
			//alert("second");
			return [number, true];
		}
		if (number < 0){ 
			//alert("third");
			$scope.canProceed = false;
			return [number, false];
		}
		//alert("fourth");
		return [number, true];
	}

	CheckAttribute = function(attribute){
		if(attribute  == "" || attribute  == undefined){
			$scope.canProceed = false;
			return true;
		}
		return false;
	}

	ConvertMealTypesBinaryToString = function(){
		var mealTypesString = "";
		if($scope.mealTypesBinary[0] == 1) mealTypesString += "Breakfast ";
		if($scope.mealTypesBinary[1] == 1) mealTypesString += "Lunch ";
		if($scope.mealTypesBinary[2] == 1) mealTypesString += "Dinner ";
		if($scope.mealTypesBinary[3] == 1) mealTypesString += "Snacks";
		return mealTypesString;
	}

	AddItem = function(){
		var dataToSend = {};
		dataToSend.name = $scope.foodName;
		dataToSend.hebrew_name = $scope.foodHebrewName;
		dataToSend.arabic_name = $scope.foodArabicName;
		dataToSend.food_type = $scope.foodType;
		dataToSend.meal_type = $scope.mealTypesBinary;
		dataToSend.calcium = $scope.calciumModel;
		dataToSend.potassium = $scope.potassiumModel;
		dataToSend.moisture = $scope.moistureModel;
		dataToSend.protein = $scope.proteinModel;
		dataToSend.carbohydrates = $scope.carbohydratesModel;
		dataToSend.na = $scope.naModel;
		dataToSend.alcohol = $scope.alcoholModel;
		dataToSend.energy = $scope.energyModel;
		dataToSend.fatness = $scope.fatnessModel;
		dataToSend.menu_image = $scope.menuImageFile;

		dataToSend.img_file = $scope.firstImageFile;
		dataToSend.weight = $scope.firstImageWeightModel;
		dataToSend.width = $scope.firstImageWidthModel;
		dataToSend.height = $scope.firstImageHeightModel;

		dataToSend.img_file2 = $scope.secondImageFile;
		dataToSend.weight2 = $scope.secondImageWeightModel;
		dataToSend.width2 = $scope.secondImageWidthModel;
		dataToSend.height2 = $scope.secondImageHeightModel;

		if(dataToSend.img_file2 == "" || dataToSend.img_file2  == undefined){
			$scope.thirdImageFile = $scope.fourthImageFile = dataToSend.img_file2;
		}

		dataToSend.img_file3 = $scope.thirdImageFile;
		dataToSend.weight3 = $scope.thirdImageWeightModel;
		dataToSend.width3 = $scope.thirdImageWidthModel;
		dataToSend.height3 = $scope.thirdImageHeightModel;

		if(dataToSend.img_file3 == "" || dataToSend.img_file4  == undefined){
			$scope.thirdImageFile = $scope.fourthImageFile = dataToSend.img_file2;
		}

		dataToSend.img_file4 = $scope.fourthImageFile;
		dataToSend.weight4 = $scope.fourthImageWeightModel;
		dataToSend.width4 = $scope.fourthImageWidthModel;
		dataToSend.height4 = $scope.fourthImageHeightModel;

		requestUrl = "http://127.0.0.1:3000/addFoodItem";
		$scope.request_status = "Executing request...";
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify(dataToSend),
			    headers: { 
			    	'Content-Type': 'application/x-www-form-urlencoded' }
			});
		// Check whether the HTTP Request is successful or not. 
		request.success(function (data) {
			$scope.request_status = "";
			dataToSend.id = data.id;
			var imagesStyles = GetImagesStyles();
			dataToSend.first_img_style = imagesStyles[0];
			dataToSend.second_img_style = imagesStyles[1];
			dataToSend.third_img_style = imagesStyles[2];
			dataToSend.fourth_img_style = imagesStyles[3];
			if(dataToSend.img_file2 == undefined) dataToSend.img_file2 = "null";
			if(dataToSend.img_file3 == undefined) dataToSend.img_file3 = "null";
			if(dataToSend.img_file4 == undefined) dataToSend.img_file4 = "null";
			dataToSend.meal_type = ConvertMealTypesBinaryToString();
			dataToSend.food_type = $scope.foodTypes[$scope.foodType];
			dataSharingService.AddFoodItem(dataToSend);
			ShowSuccessMessageAndChangeLocation("Item was successfully added");
		}).error(function (data) {
			$scope.request_status = "Request failed";
			ShowErrorMessage(data);
		});
	}

	UpdateItem = function(){
		var dataToSend = {};
		dataToSend.id = $scope.itemToUpdate.id;
		if($scope.itemToUpdate.name != $scope.foodName) dataToSend.name = $scope.foodName;
		if($scope.itemToUpdate.hebrew_name != $scope.foodHebrewName) dataToSend.hebrew_name = $scope.foodHebrewName;
		if($scope.itemToUpdate.arabic_name != $scope.foodArabicName) dataToSend.arabic_name = $scope.foodArabicName;
		if($scope.foodType != $scope.foodTypes.indexOf($scope.itemToUpdate.food_type)) dataToSend.food_type = $scope.foodType;
		if($scope.itemToUpdate.meal_type != ConvertMealTypesBinaryToString()) dataToSend.meal_type = $scope.mealTypesBinary;
		if($scope.itemToUpdate.calcium != $scope.calciumModel) dataToSend.calcium = $scope.calciumModel;
		if($scope.itemToUpdate.potassium != $scope.potassiumModel) dataToSend.potassium = $scope.potassiumModel;
		if($scope.itemToUpdate.moisture != $scope.moistureModel) dataToSend.moisture = $scope.moistureModel;
		if($scope.itemToUpdate.protein != $scope.proteinModel) dataToSend.protein = $scope.proteinModel;
		if($scope.itemToUpdate.carbohydrates != $scope.carbohydratesModel) dataToSend.carbohydrates = $scope.carbohydratesModel;
		if($scope.itemToUpdate.na != $scope.naModel) dataToSend.na = $scope.naModel;
		if($scope.itemToUpdate.alcohol != $scope.alcoholModel) dataToSend.alcohol = $scope.alcoholModel;
		if($scope.itemToUpdate.energy != $scope.energyModel) dataToSend.energy = $scope.energyModel;
		if($scope.itemToUpdate.fatness != $scope.fatnessModel) dataToSend.fatness = $scope.fatnessModel;
		if($scope.itemToUpdate.menu_image != $scope.menuImageFile) dataToSend.menu_image = $scope.menuImageFile;

		if($scope.firstImageFile != $scope.itemToUpdate.img_file) dataToSend.img_file = $scope.firstImageFile;
		if($scope.firstImageWeightModel != $scope.itemToUpdate.weight) dataToSend.weight = $scope.firstImageWeightModel;
		if($scope.firstImageWidthModel != $scope.itemToUpdate.width) dataToSend.width = $scope.firstImageWidthModel;
		if($scope.firstImageHeightModel != $scope.itemToUpdate.height) dataToSend.height = $scope.firstImageHeightModel;

		if($scope.secondImageFile != $scope.itemToUpdate.img_file2) {
			dataToSend.img_file2 = $scope.secondImageFile;
			if(dataToSend.img_file2 == undefined) {
				dataToSend.img_file2 = "zzz_null_image";
				$scope.thirdImageFile = dataToSend.img_file3  = "zzz_null_image";
				$scope.fourthImageFile = dataToSend.img_file4  = "zzz_null_image";
			}
		}
		if($scope.secondImageFile != "" && $scope.secondImageFile  != undefined){
			if($scope.secondImageWeightModel != $scope.itemToUpdate.weight2) dataToSend.weight2 = $scope.secondImageWeightModel;
			if($scope.secondImageWidthModel != $scope.itemToUpdate.width2) dataToSend.width2 = $scope.secondImageWidthModel;
			if($scope.secondImageHeightModel != $scope.itemToUpdate.height2) dataToSend.height2 = $scope.secondImageHeightModel;	

			if($scope.thirdImageFile != $scope.itemToUpdate.img_file3) {
				dataToSend.img_file3 = $scope.thirdImageFile;
				if(dataToSend.img_file3 == undefined) {
					dataToSend.img_file3 = "zzz_null_image";
					$scope.fourthImageFile = dataToSend.img_file4  = "zzz_null_image";
				}
			}
			if($scope.thirdImageFile != "" && $scope.thirdImageFile  != undefined){
				if($scope.thirdImageWeightModel != $scope.itemToUpdate.weight3) dataToSend.weight3 = $scope.thirdImageWeightModel;
				if($scope.thirdImageWidthModel != $scope.itemToUpdate.width3) dataToSend.width3 = $scope.thirdImageWidthModel;
				if($scope.thirdImageHeightModel != $scope.itemToUpdate.height3) dataToSend.height3 = $scope.thirdImageHeightModel;	

				if($scope.fourthImageFile != $scope.itemToUpdate.img_file4) {
					dataToSend.img_file4 = $scope.fourthImageFile;
					if(dataToSend.img_file4 == undefined) dataToSend.img_file4 = "zzz_null_image";
				}
				if($scope.fourthImageFile != "" && $scope.fourthImageFile  != undefined){
					if($scope.fourthImageWeightModel != $scope.itemToUpdate.weight4) dataToSend.weight4 = $scope.fourthImageWeightModel;
					if($scope.fourthImageWidthModel != $scope.itemToUpdate.width4) dataToSend.width4 = $scope.fourthImageWidthModel;
					if($scope.fourthImageHeightModel != $scope.itemToUpdate.height4) dataToSend.height4 = $scope.fourthImageHeightModel;	
				}
			}

		}


		$scope.request_status = "Executing request...";
		requestUrl = "http://127.0.0.1:3000/updateFoodItem";
		var request = $http({
		    method: "post",
		    url: requestUrl,
		    data: JSON.stringify(dataToSend),
			    headers: { 
			    	'Content-Type': 'application/x-www-form-urlencoded' }
			});
		//Check whether the HTTP Request is successful or not. 
		request.success(function (data) {
			//Updating existing item
			$scope.request_status = "";
			if(dataToSend.hasOwnProperty("meal_type")) dataToSend.meal_type = ConvertMealTypesBinaryToString();
			if(dataToSend.hasOwnProperty("food_type")) dataToSend.food_type = $scope.foodTypes[$scope.foodType];
			if(dataToSend.img_file2 == undefined) dataToSend.img_file2 = "null";
			if(dataToSend.img_file3 == undefined) dataToSend.img_file3 = "null";
			if(dataToSend.img_file4 == undefined) dataToSend.img_file4 = "null";
			var imagesStyles = GetImagesStyles();
			dataToSend.first_img_style = imagesStyles[0];
			dataToSend.second_img_style = imagesStyles[1];
			dataToSend.third_img_style = imagesStyles[2];
			dataToSend.fourth_img_style = imagesStyles[3];
			dataSharingService.UpdateFoodItem(dataToSend);
			ShowSuccessMessageAndChangeLocation("Item was successfully updated");
		}).error(function (data) {
			$scope.request_status = "Request failed";
			ShowErrorMessage(data);
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

	GetImagesStyles = function(){

		imgProperties = GetImageProperties(null, parseInt($scope.firstImageWidthModel), parseInt($scope.firstImageHeightModel));
	    firstImgStyle = {"width" : imgProperties[0],
						"height" : imgProperties[1]};
		secondImgStyle = thirdImgStyle = fourthImgStyle = {"width" : 90,
															"height" : 90};											
		if($scope.secondImageFile != "" && $scope.secondImageFile  != undefined){
			imgProperties = GetImageProperties(null, parseInt($scope.secondImageWidthModel), parseInt($scope.secondImageWidthModel));
	    	secondImgStyle = {"width" : imgProperties[0],
							"height" : imgProperties[1]};

			if($scope.thirdImageFile != "" && $scope.thirdImageFile  != undefined){
				imgProperties = GetImageProperties(null, parseInt($scope.thirdImageWidthModel), parseInt($scope.thirdImageWidthModel));
	        	thirdImgStyle = {"width" : imgProperties[0],
								"height" : imgProperties[1]};

				if($scope.fourthImageFile != "" && $scope.fourthImageFile  != undefined){
					imgProperties = GetImageProperties(null, parseInt($scope.fourthImageWidthModel), parseInt($scope.fourthImageWidthModel));
	            	fourthImgStyle = {"width" : imgProperties[0],
									"height" : imgProperties[1]};
				}
			}
		}

		return [firstImgStyle, secondImgStyle, thirdImgStyle, fourthImgStyle];
	}

	CheckIfAllRequiredAttributesFilled = function(){
		$scope.canProceed = true;//This is variable which tells if all the main fields are fullfiled and if fullfilled values are valid
		$scope.additionalImagesCanProceed = true;//In case more than one image were uploaded this variable tells if
												 //all needed fields were properly fullfilled

		$scope.foodNameRequired = CheckAttribute($scope.foodName);
		$scope.foodHebrewNameRequired = CheckAttribute($scope.foodHebrewName);
		$scope.foodArabicNameRequired = CheckAttribute($scope.foodArabicName);



		if ($scope.foodTypeButtonText  == "Food Type"){
			$scope.foodTypeChosen = false;
			$scope.canProceed = false;
		}
		else{
			$scope.foodTypeChosen = true;
		}
		
		
		if ($scope.mealTypesBinary[0] == 0 && $scope.mealTypesBinary[1] == 0 && $scope.mealTypesBinary[2] == 0  && $scope.mealTypesBinary[3] == 0){
			$scope.mealTypeChosen = false;
			$scope.canProceed = false;
		}
		else{
			$scope.mealTypeChosen = true;
		}

		var modelAndIfFilled = CheckFloatNumberValidity2($scope.calciumModel);
		$scope.calciumModel = modelAndIfFilled[0].toString();
		$scope.calciumFilled = modelAndIfFilled[1];

		modelAndIfFilled = CheckFloatNumberValidity2($scope.potassiumModel);
		$scope.potassiumModel = modelAndIfFilled[0].toString();
		$scope.potassiumFilled = modelAndIfFilled[1];
		
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.moistureModel);
		$scope.moistureModel = modelAndIfFilled[0].toString();
		$scope.moistureFilled = modelAndIfFilled[1];
		
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.proteinModel);
		$scope.proteinModel = modelAndIfFilled[0].toString();
		$scope.proteinFilled = modelAndIfFilled[1];
		
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.carbohydratesModel);
		$scope.carbohydratesModel = modelAndIfFilled[0].toString();
		$scope.carbohydratesFilled = modelAndIfFilled[1];
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.naModel);
		$scope.naModel = modelAndIfFilled[0].toString();
		$scope.naFilled = modelAndIfFilled[1];
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.alcoholModel);
		$scope.alcoholModel = modelAndIfFilled[0].toString();
		$scope.alcoholFilled = modelAndIfFilled[1];
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.energyModel);
		$scope.energyModel = modelAndIfFilled[0].toString();
		$scope.energyFilled = modelAndIfFilled[1];
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.fatnessModel);
		$scope.fatnessModel = modelAndIfFilled[0].toString();
		$scope.fatnessFilled = modelAndIfFilled[1];

		$scope.menuImageFileFilled = !CheckAttribute($scope.menuImageFile);

		$scope.firstImageFileFilled = !CheckAttribute($scope.firstImageFile);
		modelAndIfFilled = CheckFloatNumberValidity2($scope.firstImageWeightModel);
		$scope.firstImageWeightModel = modelAndIfFilled[0].toString();
		$scope.firstImageWeightFilled = modelAndIfFilled[1];
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.firstImageWidthModel);
		$scope.firstImageWidthModel = modelAndIfFilled[0].toString();
		$scope.firstImageWidthFilled = modelAndIfFilled[1];
		
		modelAndIfFilled = CheckFloatNumberValidity2($scope.firstImageHeightModel);
		$scope.firstImageHeightModel = modelAndIfFilled[0].toString();
		$scope.firstImageHeightFilled = modelAndIfFilled[1];

		$scope.firstImage = {	imageFile: $scope.firstImageFile,
						        imageHeight: $scope.firstImageHeightModel,
						        imageWidth: $scope.firstImageWidthModel,
						        imageWeight: $scope.firstImageWeightModel }

		if ($scope.secondImageFile  != "" && $scope.secondImageFile  != undefined){

			$scope.secondImageProceed = true;
			numberValidity = CheckImageProperty($scope.secondImageWeightModel)
			$scope.secondImageWeightModel = numberValidity[0];
			$scope.secondImageWeightFilled = numberValidity[1];

			numberValidity = CheckImageProperty($scope.secondImageWidthModel)
			$scope.secondImageWidthModel = numberValidity[0];
			$scope.secondImageWidthFilled = numberValidity[1];

			numberValidity = CheckImageProperty($scope.secondImageHeightModel)
			$scope.secondImageHeightModel = numberValidity[0];
			$scope.secondImageHeightFilled = numberValidity[1];

			$scope.secondImage = {	imageFile: $scope.secondImageFile,
								        imageHeight: $scope.secondImageHeightModel,
								        imageWidth: $scope.secondImageWidthModel,
								        imageWeight: $scope.secondImageWeightModel }


			if ($scope.thirdImageFile  != "" && $scope.thirdImageFile  != undefined){

				$scope.thirdImageProceed = true;

				numberValidity = CheckImageProperty($scope.thirdImageWeightModel)
				$scope.thirdImageWeightModel = numberValidity[0];
				$scope.thirdImageWeightFilled = numberValidity[1];

				numberValidity = CheckImageProperty($scope.thirdImageWidthModel)
				$scope.thirdImageWidthModel = numberValidity[0];
				$scope.thirdImageWidthFilled = numberValidity[1];

				numberValidity = CheckImageProperty($scope.thirdImageHeightModel)
				$scope.secondImageHeightModel = numberValidity[0];
				$scope.thirdImageHeightFilled = numberValidity[1];

				$scope.thirdImage = {	imageFile: $scope.thirdImageFile,
								        imageHeight: $scope.thirdImageHeightModel,
								        imageWidth: $scope.thirdImageWidthModel,
								        imageWeight: $scope.thirdImageWeightModel }

				if ($scope.fourthImageFile  != "" && $scope.fourthImageFile  != undefined){
					$scope.fourthImageProceed = true;

					numberValidity = CheckImageProperty($scope.fourthImageWeightModel)
					$scope.fourthImageWeightModel = numberValidity[0];
					$scope.fourthImageWeightFilled = numberValidity[1];

					numberValidity = CheckImageProperty($scope.fourthImageWidthModel)
					$scope.fourthImageWidthModel = numberValidity[0];
					$scope.fourthImageWidthFilled = numberValidity[1];

					numberValidity = CheckImageProperty($scope.fourthImageHeightModel)
					$scope.fourthImageHeightModel = numberValidity[0];
					$scope.fourthImageHeightFilled = numberValidity[1];

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
			$scope.request_status = "Fill all required fields";
			return false;
		}
		$scope.request_status = "";
		return true;
	}

	ShowSuccessMessageAndChangeLocation = function(messageToShow){
		$timeout(function () {
		      $location.path("/showAllFoodItems");
		  }, 1750);
		ModalService.showModal({
		      templateUrl: "templates/requestResultWindow.html",
		      controller: "ModalWindowController",
		      title: "Success",
		      textToShow: messageToShow,
		      time: 1250,
		      preClose: (modal) => { modal.element.modal('hide'); }
		    }).then(function(modal) {
				    	modal.element.modal();
			    });
	}

	ShowErrorMessage = function(messageToShow){
		ModalService.showModal({
	      templateUrl: "templates/requestResultWindow.html",
	      controller: "ModalWindowController",
	      title: "Error",
	      textToShow: messageToShow,
	      time: 2500,
	      preClose: (modal) => { modal.element.modal('hide'); }
	    }).then(function(modal) {
			    	modal.element.modal();
		    });
	}
	
	$scope.AddUpdateItem = function() {
		
		if(CheckIfAllRequiredAttributesFilled() == false) return;
		
		if (dataSharingService.IfToUpdate()) UpdateItem();
		else AddItem();
	}
});
