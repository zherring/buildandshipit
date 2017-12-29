'use strict';

app.controller('archiveController', ['$rootScope', '$scope', 'UtilityService', 'TileService', function($rootScope, $scope, utils, tiles){
    // $rootScope.viewClass = 'archive';
    $scope.init();

    // do stuff

    $scope.doRestoreTile = function(tileId){
        var index = _.findIndex($scope.archives, function(tile){
            return tile.tid === tileId;
        });

        var tile = $scope.archives[index];
        $scope.tiles = tiles.getTiles($scope.currentSetKey);

        $scope.tiles.push(tile);
        tiles.saveTiles($scope.currentSetKey, $scope.tiles);

        $scope.archives.splice(index, 1);
        tiles.saveTileArchives($scope.currentSetKey, $scope.archives);
    };

}]);
