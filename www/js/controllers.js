angular.module('starter.controllers', ['ngCordova'])

  .controller('RefreshController', function($scope, $http) {
    $scope.chats = [];
    $scope.doRefresh = function() {
      $http.get('http://vts.comeze.com/UserAppData/getAllSchedule.php')
        .success(function(newItems) {
          $scope.chats = newItems;
          console.log("New Items");
        })
        .finally(function() {
          $scope.$broadcast('scroll.refreshComplete');
        });
    };
  })
  .run(function($ionicPlatform, $ionicPopup) {
    $ionicPlatform.registerBackButtonAction(function(event) {
      if (true) {
        $ionicPopup.confirm({
          title: '<b>Exit Warning</b>',
          template: 'Are you sure you want to exit?'
        }).then(function(res) {
          if (res) {
            ionic.Platform.exitApp();
          }
        })
      }
    }, 100);
  })
.controller('DashCtrl', function($scope, $http) {
  $scope.result = "";
  $http.get('http://date.jsontest.com/')
    .success(function(data, status, headers,config){
      $scope.result = data; // for UI
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
    .then(function(result){
      things = result.data;
    });
})
.controller('ChatsCtrl', function($http, $scope,$ionicLoading,$ionicPopup,$ionicPlatform, Chats) {
  $scope.loading = $ionicLoading.show({
    template: 'Loading...',
    showBackdrop: false
  });
  $scope.result = "";
  $http.get('http://vts.comeze.com/UserAppData/getAllSchedule.php')
    .success(function(data, status, headers,config){
      var i=0;
      data.forEach(function (x) {
        x['id']=i;
        i++;
      })
      $ionicLoading.hide();
      $scope.chats = data;
    })
    .error(function(data, status, headers,config){
      console.log('data error');
      $ionicLoading.hide();
      $scope.connectionError="No Internet Connection..!";
      $ionicPlatform.ready(function() {
        $ionicPopup.confirm({
          title: '<b>Connectivity Error..</b>',
          content: 'Please turn on your internet OR try again later..',
          buttons: [{
            text: 'OK',
            type: 'button-default',
            onTap: function(e) {
              //e.preventDefault();
            }
          }]
        })
          .then(function(result) {
            if(!result) {
              ionic.Platform.exitApp();
            }
          });
      });
    })
    .then(function(result){
      chats = result.data;
    });

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})
.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})
.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
  .controller('MapCtrl', function($scope, $state,$ionicLoading,Chats,$stateParams, $http, $cordovaGeolocation) {
    $scope.loading = $ionicLoading.show({
      template: 'Loading...',
      showBackdrop: false
    });
    $scope.showBasics=true;
    $scope.showMap=false;
    $scope.closeMap=false;
    $scope.showMapBtn=true;
    $scope.hideCards=function () {
      $scope.showBasics=false;
      $scope.showMap=true;
      $scope.showMapBtn=false;
      $scope.closeMap=true;
    }
    $scope.hideMap=function () {
      $scope.showBasics=true;
      $scope.showMap=false;
      $scope.showMapBtn=true;
      $scope.closeMap=false;
    }
    $scope.result = "";
    $scope.js = [];
    var bus = Chats.get($stateParams.chatId).Bus_Number;
    var route = Chats.get($stateParams.chatId).Route;
    var date = Chats.get($stateParams.chatId).date;
    var time1 = Chats.get($stateParams.chatId).Time;
    var time = time1.substring(0, time1.length - 3);
    var ind1=route.indexOf("-");
    $scope.srconly=route.substring(0,ind1)
    var src_route=route.substring(0,ind1)+" bus stand";
    var ind2=route.lastIndexOf("-");
    var dest_route=route.substring(ind2+1,route.length)+" bus stand";
    $scope.destonly=route.substring(ind2+1,route.length)
    var via=route.substring(ind1+1,ind2)+" bus stand";
    console.log(via);
    console.log(src_route);
    console.log(dest_route);
    console.log(bus);
    console.log(route);
    console.log(date);
    console.log(time);
    var geocoder = new google.maps.Geocoder();
    // var address = document.getElementById("txtAddress").value;
    geocoder.geocode({ 'address': src_route }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        $scope.latitude_src = results[0].geometry.location.lat();
        $scope.longitude_src = results[0].geometry.location.lng();
        console.log("Latitude: " + $scope.latitude_src + "\nLongitude: " + $scope.longitude_src);
      } else {
        console.log("Request failed.")
      }
    });
    geocoder.geocode({ 'address': dest_route }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        $scope.latitude_dest = results[0].geometry.location.lat();
        $scope.longitude_dest = results[0].geometry.location.lng();
        console.log("Latitude: " + $scope.latitude_dest + "\nLongitude: " + $scope.longitude_dest);
      } else {
        console.log("Request failed.")
      }
    });
    var json = [
      {
        lat: 16.123456147,
        lng: 74.124563214
      }
    ]
    var config = {
      params: {
        Route: route, Bus_Number: bus, date: date, Time: time
      }
    }
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins:[src_route, via],
        destinations:[via, dest_route],
        travelMode: google.maps.TravelMode.DRIVING,
      }, callback);

    function callback(response, status) {
      // See Parsing the Results for
      // the basics of a callback function.
      console.log(response);
      if (status != google.maps.DistanceMatrixStatus.OK) {
        console.log(response);
      } else {
        var origin = response.originAddresses[0];
        var destination = response.destinationAddresses[0];
        if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
          console.log("Better get on a plane. There are no roads between "
            + origin + " and " + destination);
        } else {
          var distance1 = response.rows[0].elements[0].distance;
          var distance2 = response.rows[1].elements[1].distance;
          var x=distance1.text.substring(0,distance1.text.length-3);
          var y=distance2.text.substring(0,distance1.text.length-3);
          var temp=parseFloat(x)+parseFloat(y);
          var distance=Math.round(temp*100)/100;
          var duration1=response.rows[0].elements[0].duration;
          var duration2=response.rows[1].elements[1].duration;
          console.log(duration1);
          var x1=duration1.text.substring(0,duration1.text.length-4);

          var y1=duration2.text.substring(0,duration2.text.length-4);
          var temp1=parseFloat(x1)+parseFloat(y1);
          var duration=Math.round(temp1*100)/100;
          console.log("It is " + distance + " km");
          console.log("Required Time: "+duration);
          $scope.totaldistance=distance;
          $scope.timerequired=duration;
        }
      }
      $ionicLoading.hide();
    }

    setInterval(function () {
      $http.get('http://vts.comeze.com/UserAppData/SendCurrentPoints.php', config)
        .success(function (data, status, headers, config) {
          $scope.js = data; // for UI
          console.log($scope.js);
          console.log($scope.js.Points[0].lattitude);
          console.log($scope.js.Points[0].longitude);
          var options = {timeout: 10000, enableHighAccuracy: true};
          var mypt = $scope.js[0];
          $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
              var latLng = new google.maps.LatLng($scope.js.Points[0].lattitude, $scope.js.Points[0].longitude);
              var service = new google.maps.DistanceMatrixService();
              console.log(latLng+" "+dest_route);
              service.getDistanceMatrix(
                {
                  origins:[latLng],
                  destinations:[dest_route],
                  travelMode: google.maps.TravelMode.DRIVING,
                }, callback);

              function callback(response, status) {
                // See Parsing the Results for
                // the basics of a callback function.
                console.log(response);
                if (status != google.maps.DistanceMatrixStatus.OK) {
                  console.log(response);
                } else {
                  var origin = response.originAddresses[0];
                  var destination = response.destinationAddresses[0];
                  if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
                    console.log("Better get on a plane. There are no roads between "
                      + origin + " and " + destination);
                  } else {
                    var distance1 = response.rows[0].elements[0].distance;
                    var distance=distance1.text;
                    var duration1=response.rows[0].elements[0].duration;

                    var duration=duration1.text;
                    console.log("It is " + distance + " km");
                    console.log("Required Time: "+duration);
                    $scope.actualdistance=distance;
                    $scope.actualtimerequired=duration;
                  }
                }
                $ionicLoading.hide();
              }
              var latLng1 = new google.maps.LatLng($scope.latitude_src, $scope.longitude_src);
              var latLng2 = new google.maps.LatLng($scope.latitude_dest, $scope.longitude_dest);
              console.log("Entered");
              console.log(src_route+" "+$scope.latitude_src);
              var mapOptions = {
                center: latLng,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              };

              $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
              // $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions1);
              var marker = new google.maps.Marker({
                position: latLng,
                icon:'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                label:"Bus",
              });
              var marker1 = new google.maps.Marker({
                position: latLng1,
                label: src_route,
              });
              var marker2 = new google.maps.Marker({
                position: latLng2,
                label: dest_route,
              });
              marker.setMap($scope.map);
              marker1.setMap($scope.map);
              marker2.setMap($scope.map);
              google.maps.event.addDomListener(window, 'load', this);
/*              $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?origins=Miraj%20Bus%20stand&destinations=Sangli%20Bus%20stand&mode=Driving&language=fr-FR&key=AIzaSyBDS127lMa2YPIqMr8U7GcJIbAt2_Yl3Ps')
                .success(function (data) {
                  $scope.arrivalTime=data;
                  console.log($scope.arrivalTime);
                })*/
              var waypts=[];
              waypts.push({
                location:via,
                stopover:true
              });

         /*     waypts.push({
                location:"Pushparaj chowk, sangli",
                stopover:true
              });*/

              var directionService=new google.maps.DirectionsService();
              directionService.route({
                origin:$scope.latitude_src+','+$scope.longitude_src,
                destination:$scope.latitude_dest+','+$scope.longitude_dest,
                waypoints:waypts,
                optimizeWaypoints:false,
                travelMode: 'DRIVING',
                transitOptions: {
                  departureTime: new Date(1337675679473),
                  modes: ['BUS'],
                  routingPreference: 'FEWER_TRANSFERS'
                },
                unitSystem: google.maps.UnitSystem.IMPERIAL
              }, function (response, status) {
                var directionsDisplay = new google.maps.DirectionsRenderer({
                  suppressMarkers: true,
                  map: $scope.map,
                  directions: response,
                  draggable: false,
                  suppressPolylines: false,
                  // IF YOU SET `suppressPolylines` TO FALSE, THE LINE WILL BE
                  // AUTOMATICALLY DRAWN FOR YOU.
                });
                console.log(response);
                pathPoints = response.routes[0].overview_path.map(function (location) {
                  return {lat: location.lat(), lng: location.lng()};
                });
                var assumedPath = new google.maps.Polyline({
                  path: pathPoints, //APPLY LIST TO PATH
                  geodesic: true,
                  strokeColor: '#708090',
                  strokeOpacity: 0.7,
                  strokeWeight: 2.5
                });

                assumedPath.setMap($scope.map); // Set the path object to the map
              })
            },
            function (error) {
              console.log(error);
            });
        })
        .error(function (data, status, headers, config) {
          console.log('data error');
        })
        .then(function (result) {
          $scope.js = result.data;
        });
    },20000)
  });
