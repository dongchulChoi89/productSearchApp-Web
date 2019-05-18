app.controller('searchCtrl',function($scope, $http, $timeout) {

    //myUrl = 'http://localhost:8081';
    myUrl = 'http://dongchulchoi.us-east-2.elasticbeanstalk.com';

    $scope.noRecords = false;
    $scope.errors = false;
    $scope.progressBar = false;
    $scope.pagIndex=0;

    $scope.productView=false;
    $scope.photosView=false;
    $scope.shippingView=false;
    $scope.sellerView=false;
    $scope.similarProductsView=false;

    $scope.orderByOption1='';
    $scope.orderByOption2='';
    $scope.showMoreLess = 5;

    $scope.fromSearchList = false;
    $scope.fromWishList = false;

    $scope.slideEffect = false;

    $scope.requestZip = function() {


        var zipUrl = myUrl + '/zip';
        $http.get(zipUrl)
            .then(function (respond) {
                isApiRequestSuccess = true; // need error handling
                if(isApiRequestSuccess){
                    $scope.searchForm.currentZip = respond.data.zip;
                }else{
                    $scope.errors = true;
                    $scope.searchView = false;
                    $scope.wishView = false;
                    console.log('API Request Failed')
                }
            }, function (respond) {
                $scope.errors = true;
                $scope.searchView = false;
                $scope.wishView = false;
                console.log('Bad server response')
            });
    };
    $scope.requestZip();



    $scope.searchForm = {
        keywords : '',
        category : '',
        new : false,
        used : false,
        unspecified : false,
        localPickupOnly : false,
        freeShippingOnly : false,
        miles : '',
        from : 'current',
        otherZip : ''
    };

    $scope.resetForm = function(){
        $scope.searchForm.keywords = '';
        $scope.searchForm.category = '';
        $scope.searchForm.new = false;
        $scope.searchForm.used = false;
        $scope.searchForm.unspecified = false;
        $scope.searchForm.localPickupOnly = false;
        $scope.searchForm.freeShippingOnly = false;
        $scope.searchForm.miles = '';
        $scope.searchForm.from = 'current';
        $scope.searchForm.otherZip = '';
        $scope.mainView=false;
        $scope.firstClickList=false;
        $scope.otherClicked=true;
        $scope.searchText='';
        $scope.errors=false;
        $scope.noRecords=false;
        $('#resultsTab').tab('show');
    };



    $scope.requestEbay = function() {
        $('#resultsTab').tab('show');
        $scope.noRecords = false;
        $scope.errors = false;
        $scope.firstClickList=false;
        $scope.progressBar = true; //*


        var ebayUrl = myUrl + '/ebay';
        var param = {
           keywords : $scope.searchForm.keywords,
           category : $scope.searchForm.category,
           new : $scope.searchForm.new,
           used : $scope.searchForm.used,
           unspecified : $scope.searchForm.unspecified,
           localPickupOnly : $scope.searchForm.localPickupOnly,
           freeShippingOnly : $scope.searchForm.freeShippingOnly,
           miles : $scope.searchForm.miles!=''?$scope.searchForm.miles:null,
           zip : $scope.searchForm.from=='current'?$scope.searchForm.currentZip:$scope.searchForm.otherZip
        };

        $http.get(ebayUrl, {params : param})
            .then(function (respond) {
                isApiRequestSuccess = respond.data.findItemsAdvancedResponse[0].ack[0];
                if(isApiRequestSuccess=='Success'){
                    console.log(respond.data);
                    if(respond.data.findItemsAdvancedResponse[0].searchResult[0]['@count']==0){
                        $scope.progressBar = false;
                        $scope.errors = false;
                        $scope.noRecords = true;
                        $scope.searchView = false;
                        $scope.wishView = false;
                        //$scope.searchList[0]['count']=0;
                        $scope.searchList[0]['count']!=undefined?$scope.searchList[0]['count']=0:'';
                    }else{
                        $scope.processEbayData(respond.data);
                        $scope.progressBar = false; //*
                    }

                }else{
                    console.log('API Request Failed')
                    console.log(respond.data.findItemsAdvancedResponse[0].errorMessage[0]['error'][0]['message'][0]);
                    $scope.progressBar = false;
                    $scope.errors = true;
                    $scope.noRecords = false;
                    $scope.searchView = false;
                    $scope.wishView = false;
                }
            }, function (respond) {
                console.log('Bad server response')
                $scope.progressBar = false;
                $scope.errors = true;
                $scope.noRecords = false;
                $scope.searchView = false;
                $scope.wishView = false;
            });
        $scope.mainView=true;

        $scope.viewSearch();
    };

    $scope.processEbayData = function(raw){
        var searchList = [];
        var items = raw.findItemsAdvancedResponse[0].searchResult[0].item;

        var i=1;
        items.forEach(function(item){
            id = item['itemId'][0]
            if(id in localStorage ){
                wish = true;
            } else{
                wish = false;
            }
            console.log(item['galleryURL']===undefined?i:"none");


            searchList.push(
                {
                    'id' : id,
                    'index' : i++,
                    'image' : item.galleryURL===undefined?'N/A':item.galleryURL[0],
                    'title' : item.title===undefined?'':item.title[0],
                    'price' : item.sellingStatus===undefined?'N/A':'$'+item.sellingStatus[0]['currentPrice'][0]['__value__'],
                    'shipping' : item.shippingInfo===undefined?'N/A':(item.shippingInfo[0]['shippingServiceCost']===undefined?'N/A':(item.shippingInfo[0]['shippingServiceCost'][0]['__value__']===undefined?'N/A':(item.shippingInfo[0]['shippingServiceCost'][0]['__value__']==0?'Free Shipping':'$'+item.shippingInfo[0]['shippingServiceCost'][0]['__value__']))),
                    'zip' : item.postalCode===undefined?'N/A':item.postalCode[0],
                    'seller' : item.sellerInfo===undefined?'N/A':(item.sellerInfo[0]['sellerUserName']===undefined?'N/A':item.sellerInfo[0]['sellerUserName'][0]) ,
                    'wish' : wish,
                    'shippingInfo' : item['shippingInfo']===undefined?'N/A':item['shippingInfo'][0],
                    'returnAccepted' : item['returnsAccepted']===undefined?'N/A':item['returnsAccepted'][0],
                    'sellerInfo' : item['sellerInfo']===undefined?'N/A':item['sellerInfo'][0],
                    'storeInfo' : item['storeInfo']===undefined?'N/A':item['storeInfo'][0],
                    'count' : parseInt(raw.findItemsAdvancedResponse[0].searchResult[0]['@count'])
                }
            );
        });
        $scope.searchList = searchList;
    };

    $scope.processWishData = function(){


        var wishList = [];

        for(i=0;i<localStorage.length;i++){
            item = JSON.parse(localStorage.getItem(localStorage.key(i)));

            wishList.push(
                {
                    'id' : item['id'],
                    'index' : (i+1),
                    'image' : item['image'],
                    'title' : item['title'],
                    'price' : item['price'],
                    'shipping' : item['shipping'],
                    'zip' : item['zip'],
                    'seller' : item['seller'],
                    'wish' : item['wish'],
                    'shippingInfo' : item['shippingInfo'],
                    'returnAccepted' : item['returnsAccepted'],
                    'sellerInfo' : item['sellerInfo'],
                    'storeInfo' : item['storeInfo'],
                    'searchIndex' : item['index']
                }
            );
        };

        $scope.wishList = wishList;

    };

    $scope.searchView=true;
    $scope.wishView=false;
    $scope.detailView=false;
    $scope.firstClickList=false;

    $scope.viewSearch = function(){
        $('#resultsTab').tab('show');
        $scope.searchView=true;
        $scope.wishView=false;
        $scope.detailView=false;
        $scope.requestEbayDetailTimeout();
    };

    $scope.viewDetail = function(){
        $scope.searchView=false;
        $scope.wishView=false;
        $scope.requestEbayDetailTimeout();
        $scope.detailView=true;
    };

    $scope.viewWish = function(){
        $scope.processWishData();
        $scope.searchView=false;
        $scope.wishView=true;
        $scope.detailView=false;
        $scope.requestEbayDetailTimeout();
    }

    $scope.requestEbayDetailTimeout = function() {
        $scope.progressBar = true; //*
        $timeout(function(){$scope.progressBar=false},500);
    };

    $scope.requestEbayDetail = function(itemId,itemTitle,shippingInfo,returnAccepted,sellerInfo,storeInfo,from) {
        $scope.progressBar = true; //*


        $('#productViewTab').tab('show');
        $('#productViewTab').trigger('click');

        $scope.productView=true;
        $scope.productView=true;$scope.photosView=false;$scope.shippingView=false;$scope.sellerView=false;$scope.similarProductsView=false;

        var ebayUrl = myUrl + '/ebayDetail';
        $scope.itemId = itemId;
        $scope.itemTitle = itemTitle;
        $scope.shippingInfo = shippingInfo;
        $scope.returnAccepted = returnAccepted;
        $scope.sellerInfo = sellerInfo;
        $scope.storeInfo = storeInfo;

        var param = {
            itemId : itemId
        };

        $http.get(ebayUrl, {params : param})
            .then(function (respond) {
                isApiRequestSuccess = respond.data['Ack'];
                if(isApiRequestSuccess=='Success'){
                    console.log(respond.data);
                    $scope.processEbayDetailData(respond.data);
                    $scope.progressBar = false; //*


                }else{
                    console.log('API Request Failed')
                    console.log(respond.data['Errors']['ShortMessage']);

                    $scope.progressBar = false;
                    $scope.errors = true;
                    $scope.noRecords = false;
                    $scope.searchView = false;
                    $scope.wishView = false;
                }
            }, function (respond) {
                console.log('Bad server response')

                $scope.progressBar = false;
                $scope.errors = true;
                $scope.noRecords = false;
                $scope.searchView = false;
                $scope.wishView = false;
            });

        $scope.viewDetail();

        if(from==1){
            $('#resultsTab').tab('show');
            $scope.fromSearchList=true;
            $scope.fromWishList=false;
        }else {
            $('#wishTab').tab('show');
            $scope.fromSearchList=false;
            $scope.fromWishList=true;
        }

    };

    $scope.processEbayDetailData = function(raw){


        var detailBasicList = [];
        var detailSpecificList = [];
        var item = raw['Item'];
        var itemSpecifics = item['ItemSpecifics']['NameValueList'];

        //console.log(item['ItemID']);
        if(item['ItemID'] in localStorage ){
            wish = true;
        } else{
            wish = false;
        }

        var index=0;
        for(i=0;i<$scope.searchList.length;i++){

            if($scope.searchList[i]['id'] == item['ItemID']){
                index=i;
            }
        }

        detailBasicList.push(
            {
                'productIamges' : item['PictureURL'],
                'subtitle' : item['Subtitle'],
                'price' : item['CurrentPrice']['Value'],
                'location' : item['Location'],
                'returnPolicy' : item['ReturnPolicy'],
                'wish' : wish,
                'id' : item['ItemID'],
                'listObj' : $scope.searchList[index],
                'ViewItemURLForNaturalSearch' : item['ViewItemURLForNaturalSearch']
            }
        );
        $scope.detailBasicList = detailBasicList;

        itemSpecifics.forEach(function(spec){
            detailSpecificList.push(
                {
                    'name' : spec['Name'],
                    'value' : spec['Value']
                }
            );
        });
        $scope.detailSpecificList = detailSpecificList;
    };

    $scope.requestGoogleCustom = function() {
        var googleCustomUrl = myUrl + '/photos';
        var param = {
            itemTitle : $scope.itemTitle
        };
        $http.get(googleCustomUrl, {params : param})
            .then(function (respond) {
               isApiRequestSuccess = true; // 예외처리 요망
                if(isApiRequestSuccess){
                    console.log(respond.data);
                    $scope.processGoogleCustomData(respond.data);
                }else{
                    console.log('API Request Failed')
                    $scope.noRecords = false;
                    $scope.errors = true;
                    $scope.searchView = false;
                    $scope.wishView = false;
                    //console.log(respond.data['Errors']['ShortMessage']);// 예외처리 요
                }
            }, function (respond) {
                console.log('Bad server response')
                $scope.noRecords = false;
                $scope.errors = true;
                $scope.searchView = false;
                $scope.wishView = false;
            });
    };

    $scope.processGoogleCustomData = function(raw){
        var photosList = [];

        var items = raw['items'];

        items.forEach(function(item){
            photosList.push(
                {
                    'link' : item['link']
                }
            );
        });

        $scope.photoList = photosList;
    };

    $scope.requestSimilarProducts = function() {
        var googleCustomUrl = myUrl + '/similarProducts';
        var param = {
            itemId : $scope.itemId
        };

        $http.get(googleCustomUrl, {params : param})
            .then(function (respond) {
                isApiRequestSuccess = true; // 예외처리 요망
                if(isApiRequestSuccess){
                    console.log(respond.data);
                    $scope.processSimilarProductsData(respond.data);
                }else{
                    console.log('API Request Failed')
                    $scope.noRecords = false;
                    $scope.errors = true;
                    $scope.searchView = false;
                    $scope.wishView = false;
                    //console.log(respond.data['Errors']['ShortMessage']);// 예외처리 요
                }
            }, function (respond) {
                console.log('Bad server response')
                $scope.noRecords = false;
                $scope.errors = true;
                $scope.searchView = false;
                $scope.wishView = false;
            });
    };

    $scope.processSimilarProductsData = function(raw){
        var similarProductsList = [];

        var items = raw['getSimilarItemsResponse']['itemRecommendations']['item'];

        items.forEach(function(item){
            similarProductsList.push(
                {
                    'imageURL' : item['imageURL'],
                    'productName' : item['title'],
                    'viewItemURL' : item['viewItemURL'],
                    'price' : parseInt(item['buyItNowPrice']['__value__']),
                    'shippingCost' : parseInt(item['shippingCost']['__value__']),
                    'daysLeft' : parseInt(item['timeLeft'].substring(1,2))
                }
            );
        });

        $scope.similarProductsList = similarProductsList;
    };

    $scope.wishList = [];

    $scope.addWishList = function(index){
        index--;

        if($scope.searchView==true){
            $scope.searchList[index].wish = true;
            localStorage.setItem($scope.searchList[index].id,JSON.stringify($scope.searchList[index]));
        }
        if($scope.wishView==true){
            $scope.wishList[index].wish = true;

            for(i=0;i<$scope.searchList.length;i++){
                if($scope.searchList[i].id == $scope.wishList[index].id){
                    $scope.searchList[i].wish = true;
                }
            }
            $scope.detailBasicList[0]['wish'] = true;

            localStorage.setItem($scope.wishList[index].id,JSON.stringify($scope.wishList[index]));
        }
        if($scope.detailView==true){
            $scope.detailBasicList[0]['wish'] = true;

            for(i=0;i<$scope.searchList.length;i++){
                if($scope.searchList[i].id == $scope.detailBasicList[0]['id']){
                    $scope.searchList[i].wish = true;
                }
            }
            for(i=0;i<$scope.wishList.length;i++){
                if($scope.wishList[i].id == $scope.detailBasicList[0]['id']){
                    $scope.wishList[i].wish = true;
                }
            }
            localStorage.setItem($scope.detailBasicList[0]['id'],JSON.stringify($scope.detailBasicList[0]['listObj']));
        }
    }

    $scope.deleteWishList = function(index){
        index--;

        if($scope.searchView==true){
            $scope.searchList[index].wish = false;
            localStorage.removeItem($scope.searchList[index].id);
        }
        if($scope.wishView==true){
            $scope.wishList[index].wish = false;

            for(i=0;i<$scope.searchList.length;i++){
                if($scope.searchList[i].id == $scope.wishList[index].id){
                    $scope.searchList[i].wish = false;
                }
            }

            localStorage.removeItem($scope.wishList[index].id);
        }
        if($scope.detailView==true){
            $scope.detailBasicList[0]['wish'] = false;

            for(i=0;i<$scope.searchList.length;i++){
                if($scope.searchList[i].id == $scope.detailBasicList[0]['id']){
                    $scope.searchList[i].wish = false;
                }
            }
            for(i=0;i<$scope.wishList.length;i++){
                if($scope.wishList[i].id == $scope.detailBasicList[0]['id']){
                    $scope.wishList[i].wish = false;
                }
            }
            localStorage.removeItem($scope.detailBasicList[0]['id']);
        }
    }

    $scope.removeWishList =function(){
        for (i=0;i<localStorage.length;i++){
            localStorage.removeItem(localStorage.key(i));
        }
    }

    $scope.days = function(days){
        var day = 0;
        day = parseInt(days);
        if(day>1){
            return day + " days";
        }
        else{
            return day + " day";
        }
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId      : '2028972824062745',
            xfbml      : true,
            version    : 'v3.2'
        });
        FB.AppEvents.logPageView();
    };
    $scope.facebook = function(){
        FB.ui({
            method: 'share',
            display: 'popup',
            quote: 'Buy '+$scope.detailBasicList[0]['listObj']['title']+' at $'+$scope.detailBasicList[0]['price']+' from LINK below',
            href: $scope.detailBasicList[0]['ViewItemURLForNaturalSearch']
        }, function(response){});
    }

    $scope.query = function(searchText) {
        return $http.get(myUrl + '/autoComplete/' + searchText)
            .then(function(respond) {
                var suggestList = [];

                console.log(respond['data']['postalCodes']);

                if(respond['data']['postalCodes'] !== null){
                    for(var i=0; i<respond['data']['postalCodes'].length;i++){
                        suggestList.push(respond['data']['postalCodes'][i]['postalCode']);
                    }
                }
                return suggestList;
            });
    };


});