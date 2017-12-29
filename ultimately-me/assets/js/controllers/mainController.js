'use strict';

app.controller('mainController', ['$rootScope', '$scope', '$timeout', '$interval', 'AccountService', 'UtilityService', 'TileService', function($rootScope, $scope, $timeout, $interval, account, utils, tiles){
    // $rootScope.viewClass = 'main';
    $scope.init();

    if(_.isUndefined($scope.preferences.tutorial)) {
        $rootScope.goTo('/tutorial');
    }

    $scope.timeoutPromise = [];

    $scope.intervalPromise = '';
    $scope.stopInterval = function() {
        if($scope.intervalPromise){
            $interval.cancel($scope.intervalPromise);
        }
    };

    $scope.startInterval = function(){
        $interval.cancel($scope.intervalPromise);
        $scope.intervalPromise = $interval(function(){
            $scope.tileData = tiles.getAllTileData($scope.currentSetKey, false);
        }, 10000);
    };

    $scope.startInterval();

    utils.deviceResume($scope.startInterval);
    utils.devicePause($scope.stopInterval);

    $scope.showRewinder = function(val, d){
        var t = {
            d: d
        };
        t.since = moment(d).subtract(val, 'minutes').fromNow();
        t.fixed = moment(d).subtract(val, 'minutes').format('MMM D @ h:mma');
        t.newD =  moment(d).subtract(val, 'minutes').valueOf();
        return t;
    };

    $scope.toggleRewind = function(tile){
        $rootScope.answers[tile.tid].editing = !$rootScope.answers[tile.tid].editing;
        $rootScope.answers[tile.tid].rewind = 0;

        if($rootScope.answers[tile.tid].editing) {
            $scope.stopInterval();
        } else {
            $scope.startInterval();
            // data refresh: fetch tileset data again because something probably changed
            $scope.tileData = tiles.getAllTileData($scope.currentSetKey, false);
        }
    };

    $scope.updateRewind = function(tile, t){
        if(t.newD && t.newD !== t.d) {
            var data = tiles.getTileData($scope.currentSetKey, tile.tid);
            _.last(data).d = t.newD;
            tiles.saveTileData($scope.currentSetKey, tile.tid, data);
        }
        $scope.toggleRewind(tile);
    };

    $scope.doArchiveTile = function(tile){
        var index = _.findIndex($scope.tiles, function(t){
            return t.tid === tile.tid;
        });

        if(index > -1) {
            var archives = tiles.getTileArchives($scope.currentSetKey);
            archives.push(tile);
            tiles.saveTileArchives($scope.currentSetKey, archives);
            $scope.tiles.splice(index, 1);
            tiles.saveTiles($scope.currentSetKey, $scope.tiles);
        }

        if(!$scope.tiles.length) {
            $scope.preferences.editing = false;
        }
    };

    $scope.dragControlListeners = {
        accept: function () {
            return true; //override to determine drag is allowed or not. default is true.
        },
        dragEnd: function(item){
            if(item.source.index !== item.dest.index) {
                var tilesArray = angular.copy($scope.tiles);
                tilesArray = _.move(tilesArray, tilesArray[item.source.index], tilesArray[item.dest.index]);
                tiles.saveTiles($scope.currentSetKey, tilesArray);
            }
        },
    };

    $scope.doRecordData = _.debounce(function($event, tile, answer){

        if($scope.preferences.editing) {
            return false;
        }

        var data = {
            d: moment().valueOf()
        };

        if(!_.isNull(answer)) {
            data.a = answer;
        }

        // do not capture scale if no answer is set
        if(tile.type === 4 && !data.a) {
            return false;
        }

        var tileData = tiles.getTimeBoxedTileData($scope.currentSetKey, tile.tid, 0);
        tileData.push(data);
        tiles.saveTileData($scope.currentSetKey, tile.tid, tileData);
        $scope.tileData = tiles.getAllTileData($scope.currentSetKey, false);

        // start with a fresh pair of undies
        $timeout.cancel($scope.timeoutPromise[tile.tid]);
        $scope.undo[tile.tid] = false;

        // in order to reset the css fadeout, the dom node needs to be removed
        // and then added back
        // HACK: 10ms is enough to cause the dom manipulation?
        $timeout(function(){
            $scope.undo[tile.tid] = true;
        }, 10);

        // fade out the icon
        $scope.timeoutPromise[tile.tid] = $timeout(function(){
            $scope.undo[tile.tid] = false;
        }, 4000);

    }, 500, true);

    $scope.undoRecordData = function($event, tile){
        if($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }

        var tileData = _.initial(tiles.getTimeBoxedTileData($scope.currentSetKey, tile.tid, 0));

        tiles.saveTileData($scope.currentSetKey, tile.tid, tileData);
        $scope.tileData = tiles.getAllTileData($scope.currentSetKey, false);

        $timeout.cancel($scope.timeoutPromise[tile.tid]);

        $scope.undo[tile.tid] = false;
    };

}]);
