var express = require('express');
var app = express();
var port = 8081;
var https = require('https');
var http = require('http');
var cors = require('cors');

app.use('/',express.static('public/'));
app.use(cors());
app.listen(port, function(){
    console.log('Port '+port+' Working')
});

app.get('/ebay',function(req, appRes){
    var jsonString ="";
    var i=0, j=0;
    var auth = 'DONGCHUL-findingA-PRD-a16e557a4-5e21619e';
    var url = 'http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0'
    url += '&SECURITY-APPNAME=' + auth;
    url += '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo%20';


    processedKeywords = req.query.keywords.trim();
    processedKeywords = processedKeywords.replace(" ","%20");

    url += '&keywords=' + processedKeywords;
    if(req.query.category!=''){
        url += '&categoryId=' + req.query.category;
    }
    url += '&buyerPostalCode=' + req.query.zip;
    if(req.query.miles!=null) {
        url += '&itemFilter(' + i + ').name=MaxDistance' + '&itemFilter(' + i + ').value=' + req.query.miles;
        i++;
    }else{
        url += '&itemFilter(' + i + ').name=MaxDistance' + '&itemFilter(' + i + ').value=10';
        i++;
    }
    url += '&itemFilter('+i+').name=HideDuplicateItems' + '&itemFilter('+i+').value=true';
    i++;
    if(req.query.freeShippingOnly){
        url += '&itemFilter('+i+').name=FreeShippingOnly' + '&itemFilter('+i+').value=' + req.query.freeShippingOnly;
        i++;
    }
    if(req.query.localPickupOnly){
        url += '&itemFilter('+i+').name=LocalPickupOnly' + '&itemFilter('+i+').value=' + req.query.localPickupOnly;
        i++;
    }
    if(req.query.new || req.query.used || req.query.unspecified){
        url += '&itemFilter('+i+').name=Condition';
        if(req.query.new){
            url += '&itemFilter('+i+').value('+j+')=New';
            j++;
        }
        if(req.query.used){
            url += '&itemFilter('+i+').value('+j+')=Used';
            j++;
        }
        if(req.query.unspecified){
            url += '&itemFilter('+i+').value('+j+')=Unspecified';
            j=0;
        }
    }
    http.get(url, function(httpRes){
        httpRes.setEncoding('UTF-8');
        httpRes.on('data', function(data){
            jsonString += data;
        });
        httpRes.on('end',function () {
            jsonObj = JSON.parse(jsonString);
            appRes.json(jsonObj);
            //console.log(jsonObj);
        });
    });
});

app.get('/ebayDetail',function(req, appRes){
    var jsonString ="";
    var auth = 'DONGCHUL-findingA-PRD-a16e557a4-5e21619e';
    var url = 'http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON'+'&appid='+auth+'&siteid=0&version=967'+'&ItemID='+req.query.itemId+'&IncludeSelector=Description,Details,ItemSpecifics'

    http.get(url, function(httpRes){
        httpRes.setEncoding('UTF-8');
        httpRes.on('data', function(data){
            jsonString += data;
        });
        httpRes.on('end',function () {
            jsonObj = JSON.parse(jsonString);
            appRes.json(jsonObj);
            //console.log(jsonObj);
        });
    });
});

app.get('/photos',function(req, appRes){
    console.log(req.itemTitle);
    var jsonString ="";
    var cx = '014699657342441021403:opyoecxfxbe';
    var key = 'AIzaSyArzhxFKMrcCvxdDt6ZHYhtRamCMFrHnBY';
    var url = 'https://www.googleapis.com/customsearch/v1?q='+req.query.itemTitle+'&cx='+cx+'&imgSize=huge&imgType=news&num=8&searchType=image&key='+key;
    console.log(url);
    https.get(url, function(httpRes){
        httpRes.setEncoding('UTF-8');
        httpRes.on('data', function(data){
            jsonString += data;
        });
        httpRes.on('end',function () {
            jsonObj = JSON.parse(jsonString);
            appRes.json(jsonObj);
            console.log(jsonObj);
        });
    });
});

app.get('/similarProducts',function(req, appRes){
    console.log(req.itemTitle);
    var jsonString ="";
    var auth = 'DONGCHUL-findingA-PRD-a16e557a4-5e21619e';
    var url = 'http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID='+auth+'&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId='+req.query.itemId+'&maxResults=20';
    console.log(url);
    http.get(url, function(httpRes){
        httpRes.setEncoding('UTF-8');
        httpRes.on('data', function(data){
            jsonString += data;
        });
        httpRes.on('end',function () {
            jsonObj = JSON.parse(jsonString);
            appRes.json(jsonObj);
            console.log(jsonObj);
        });
    });
});

app.get('/zip',function(req, appRes){
    var url = 'http://ip-api.com/json';
    var jsonString ="";

    http.get(url, function(httpRes){
        httpRes.setEncoding('UTF-8');
        httpRes.on('data', function(data){
            jsonString += data;
        });
        httpRes.on('end',function () {
            jsonObj = JSON.parse(jsonString);
            appRes.json(jsonObj);
            console.log(jsonObj);
        });
    });
});

app.get('/autoComplete/:userInput',function(req, appRes){
    var url = 'http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith='+req.params.userInput+'&username=l7lucky&country=US&maxRows=5';
    var jsonString ="";

    http.get(url, function(httpRes){
        httpRes.setEncoding('UTF-8');
        httpRes.on('data', function(data){
            jsonString += data;
        });
        httpRes.on('end',function () {
            jsonObj = JSON.parse(jsonString);
            appRes.json(jsonObj);
            console.log(jsonObj);
        });
    });
});
