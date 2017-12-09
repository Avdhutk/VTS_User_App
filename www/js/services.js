angular.module('starter.services', [])

.factory('Chats', function($http) {
  // Might use a resource here that returns a JSON array

var chats=[];
  result = "";
  $http.get('http://vts.comeze.com/UserAppData/getAllSchedule.php')
    .success(function(data, status, headers,config){

      var i=0;
      data.forEach(function (x) {
        x['id']=i;
        i++;
      })
      chats = data; // for UI
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
  .then(function(result){
      chats = result.data;
    });

  return {
    all: function() {
      return chats;

    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
       }
      return null;
    }
  };
})
.factory('Markers',function (Chats,$http,$stateParams) {

});
