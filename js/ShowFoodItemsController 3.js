angular.module("bonApp").controller('ShowFoodItemsController', function($scope, $window, $http, $location, $timeout, dataSharingService, ModalService) {
	Init = function(){
		alert("in init");
		dataSharingService.SetToUpdate(false);
		dataSharingService.CloseAllOpenWindows();
		$scope.regularItems = true;
		$scope.items = [];
		$scope.imageWidthHeightDefault = 80;
		if(dataSharingService.IfListSet()){
			$scope.items = dataSharingService.GetList();
		}
		else{
			MakeRequest("http://127.0.0.1:3000/showFoodItems");
		}
	}


	$scope.GetRemovedItems = function(){
		MakeRequest("http://127.0.0.1:3000/showRemovedFoodItems");
	}

	MakeRequest = function(requestUrl){
		alert("in MakeRequest");
		var request = $http({
			    method: "get",
			    url: requestUrl,
			});

		request.success(function (data) {
			$scope.regularItems = false;
			//Populating items list which will be then showed to the user 
			$scope.items = [];
			items = [];
			for(i = 0; i < data.length; i++){
				if(data[i].menuImage.imageFile.search("null") > -1) continue;
				//alert(data[i].menuImage.file);
				imagesArray = [data[i].menuImage, data[i].firstImage, data[i].secondImage, 
																	data[i].thirdImage, data[i].fourthImage];
				//imagesStylesArray = getImagesStylesArray(imagesArray);
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
							food_type: foodType, menu_image: data[i].menuImage.imageFile, menu_img_style: menuImgStyle,
							weight : data[i].firstImage.imageWeight, img_file : data[i].firstImage.imageFile, first_img_style: firstImgStyle, height: data[i].firstImage.imageHeight, width: data[i].firstImage.imageWidth,
							weight2 : data[i].secondImage.imageWeight, img_file2 : data[i].secondImage.imageFile, second_img_style: secondImgStyle, height2: data[i].secondImage.imageHeight, width2: data[i].secondImage.imageWidth,
							weight3 : data[i].thirdImage.imageWeight, img_file3 : data[i].thirdImage.imageFile, third_img_style: thirdImgStyle, height3: data[i].thirdImage.imageHeight, width3: data[i].thirdImage.imageWidth,
							weight4 : data[i].fourthImage.imageWeight, img_file4 : data[i].fourthImage.imageFile, fourth_img_style: fourthImgStyle, height4: data[i].fourthImage.imageHeight, width4: data[i].fourthImage.imageWidth,
							expand : false});
			}
			$scope.items = items;
			if(requestUrl == "http://127.0.0.1:3000/showFoodItems") {
				dataSharingService.AssignFoodItemsList($scope.items);
				$scope.regularItems = true;
			}
			else $scope.regularItems = false;
			$timeout(function() {
				$scope.limit = 1000;
			}, 3000);
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

  	/*$scope.deleteOpenQuestionWindows = function(item) {

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

	$scope.DeleteItem = function(item){
		var request = $http({
		    method: "post",
		    url: "http://127.0.0.1:3000/deleteFoodItem",
		    data: JSON.stringify({
		    	itemId: item.id }),
			    headers: { 
			    	'Content-Type': 'application/x-www-form-urlencoded' }
			});
		request.success(function (data) {
			DeleteUndeleteSuccessFunction("Successfully deleted "+item.name, item);
			var index = $scope.items.indexOf(item);
			dataSharingService.DeleteFoodItem(index);
		}).error(function(data){
			DeleteUndeleteErrorFunction(data);
		});
		

	}

	$scope.undeleteItem = function(item) {
		var request = $http({
		    method: "post",
		    url: "http://127.0.0.1:3000/undeleteFoodItem",
		    data: JSON.stringify({
		    	itemId: item.id }),
			    headers: { 
			    	'Content-Type': 'application/x-www-form-urlencoded' }
			});
		request.success(function (data) {
			if(dataSharingService.IfListSet) dataSharingService.AddFoodItem(item);
			DeleteUndeleteSuccessFunction("Successfully recovered "+item.name, item);
			
		}).error(function(data){
			DeleteUndeleteErrorFunction(data);
		});
	}

	DeleteUndeleteErrorFunction = function(data){
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
	}

	DeleteUndeleteSuccessFunction = function(message, item){
		var index = $scope.items.indexOf(item);
		$scope.items.splice(index, 1);
		
		ModalService.showModal({
	      templateUrl: "templates/requestResultWindow.html",
	      controller: "ModalWindowController",
	      title: "Success",
	      textToShow: message,
	      time: 1500,
	      preClose: (modal) => { modal.element.modal('hide'); }
	    }).then(function(modal) {
		    	modal.element.modal();
	    });
	}*/

	getImagesStylesArray = function(imagesArray){
		defaultImageStyle = {"width" : $scope.imageWidthHeightDefault,
								"height" : $scope.imageWidthHeightDefault};
		imagesStylesArray = [defaultImageStyle, defaultImageStyle, defaultImageStyle,
												defaultImageStyle, defaultImageStyle];
		for(i = 0; i < imagesArray.length; i++){
			if(imagesArray[i].imageFile == "null") break;
			imgProperties = GetImageProperties(null, parseInt(imagesArray[i].imageWidth), parseInt(imagesArray[i].imageHeight));
	        alert("name " + imagesArray[i].imageFileName + " width " + imgProperties[0] + " height " + imgProperties[1]);
	        imgStyle = {"width" : imgProperties[0],
							"height" : imgProperties[1]};
			imagesStylesArray[i] = imgStyle;
		}
		return imagesStylesArray;
	}

	getMealTypeString = function(mealTypesArray){
		mealTypeString = "";
		if(mealTypesArray[0] == 1){ mealTypeString += "Breakfast ";}
		if(mealTypesArray[1] == 1){ mealTypeString += "Lunch ";}
		if(mealTypesArray[2] == 1){ mealTypeString += "Dinner ";}
		if(mealTypesArray[3] == 1){ mealTypeString += "Snacks";}
		return mealTypeString;
	}

				
	$scope.ExpandContract = function(item){
		var firstImg = angular.element(document.querySelector("#first_img_"+item.id));
	    var secondImg = angular.element(document.querySelector("#second_img_"+item.id));
	    var thirdImg = angular.element(document.querySelector("#third_img_"+item.id));
	    var fourthImg = angular.element(document.querySelector("#fourth_img_"+item.id));
	    if(firstImg.attr('src') == undefined){
		    firstImg.attr('src', item.img_file);
		    secondImg.attr('src', item.img_file2);
		    thirdImg.attr('src', item.img_file3);
		    fourthImg.attr('src', item.img_file4);
		}
		item.expand = !item.expand;
	    
	}
	
	$scope.UpdateItem = function(item){
		dataSharingService.SetFoodItemToUpdateIndex($scope.items.indexOf(item));
		dataSharingService.SetToUpdate(true);
		$location.path("/addUpdateItem" );
	}
		

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

	Init();

});
