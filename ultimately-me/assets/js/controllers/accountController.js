'use strict';

app.controller('accountController', ['$rootScope', '$scope', '$timeout', '$swipe', '$location', '$http', 'TileService', function($rootScope, $scope, $timeout, $swipe, $location, $http, tiles){
    // $rootScope.viewClass = 'account';
    $scope.init();

    $scope.setRandomData = function(){
        tiles.setRandomData($scope.currentSetKey);
    };

    $scope.pushData = function(){
        var jsonPush = {};

        jsonPush = tiles.getTileSet($scope.currentSetKey);

        $http.post('http://ultme.star29dev.com/api.php', {
            cmd:'tileset',
            setKey:$scope.currentSetKey,
            setData:JSON.stringify(jsonPush)
        }).
        success(function(data, status, headers, config) {
            // window.console.log('pushed');
            // this callback will be called asynchronously
            // when the response is available
        }).
        error(function(data, status, headers, config) {
            // window.console.log('error');
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    $scope.pullData = function(){
        if(!_.isUndefined($scope.currentSetKey) && $scope.currentSetKey !== ''){
            $http.get('http://ultme.star29dev.com/api.php?cmd=tileset&set_key='+$scope.currentSetKey).
              success(function(data, status, headers, config) {
                $scope.saveTileSet($scope.currentSetKey,data);
                // window.console.log('pulled');
              }).
              error(function(data, status, headers, config) {
                // window.console.log('error');
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }
    };

}]);
