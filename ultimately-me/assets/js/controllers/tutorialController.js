'use strict';

app.controller('tutorialController', ['$rootScope', '$scope', '$document', '$timeout', 'AccountService', 'UtilityService', 'TileService', 'TileReportService', function($rootScope, $scope, $document, $timeout, account, utils, tiles, reports){

    $scope.init();

    var mockMe = function(tile){
        return tiles.getLastAnswer(tile, $scope.tileData[tile.type]);
    };

    // setup mock data containers
    $scope.tileData = [];
    $scope.tileData[1] = [];
    $scope.tileData[2] = [];
    $scope.tileData[3] = [];
    $scope.tileData[4] = [];

    $scope.currentTile = 0; // first one

    // build manual array of tiles for the type switcher
    var newTiles = [];
    _(4).times(function(i){
        i = i+1;
        newTiles.push({
            tid: 'example' + i,
            name: 'Coffee',
            showTime: 'since',
            interval: '2', // daily
            color: null,
            type: i,
            labels: {
                '1': 'yes',
                '-1': 'no'
            },
            quota: '10',
            axis: 'up',
            scale: '1', // -5 to 5
        });
        $scope.answers['example' + i] = mockMe(newTiles[i-1]);
    });

    $scope.tile = newTiles[0];

    $scope.answers[$scope.tile.tid] = mockMe($scope.tile);

    // setup stuff
    $scope.steps = _.range(1,7);

    $scope.mode = 'add';

    $scope.step = 1;
    $scope.disabled = false;
    $scope.errors = [];
    $scope.quotaRange = _.range(1, 101);
    $scope.qmin = 1;
    $scope.qmax = 20;

    $scope.tapped = false;

    var verifyTile = function() {
        $scope.errors = [];
        if(!$scope.tile.name) {
            $scope.disabled = true;
            $scope.errors.push({label: 'Title cannot be empty.', step: 1});
        }

        if(parseInt($scope.tile.type) < 1) {
            $scope.disabled = true;
            $scope.errors.push({label: 'Type needs to be chosen.', step: 2});
        }

        if(parseInt($scope.tile.type) === 2 && ($scope.tile.quota < 1 || !$scope.tile.quota)) {
            $scope.disabled = true;
            $scope.errors.push({label: 'Quota needs to be more than Zero.', step: 2});

        }
        if(parseInt($scope.tile.type) === 3 && (!$scope.tile.labels['1'] || !$scope.tile.labels['-1'])) {
            $scope.disabled = true;
            $scope.errors.push({label: 'Answers cannot be blank.', step: 2});
        }
    };

    var keepNewTilesInSync = function(newTile){
        _.each(newTiles, function(tile){
            tile.name = newTile.name;
            tile.showTime = newTile.showTime;
            tile.interval = newTile.interval;
            tile.color = newTile.color;
        });
    };

    // do stuff
    // $scope.timeoutPromise = [];

    utils.swipe($scope.step);
    verifyTile();

    // watch things
    $scope.$watch('step', function(n, o) {
        if(n !== o) {
            verifyTile();
            utils.swipe($scope.step);
        }
    });

    $scope.$watch(function(){
        return $scope.tile;
    }, function(n, o) {
        if(n !== o) {
            verifyTile();
            if(n.type !== o.type) {
                $scope.tile.type = n.type;
            }
            if($scope.mode === 'add') {
                keepNewTilesInSync(n);
            }
            $scope.answers[n.tid] = mockMe(n);
        }
    }, true);

    // do stuff
    // DOES NOT REALLY RECORD - this is for mock data tile example
    $scope.doRecordData = _.debounce(function($event, tile, answer){
        var data = {
            d: moment().valueOf()
        };

        // if(!_.isNull(answer)) {
        if(answer) {
            data.a = answer;
        }

        $scope.tileData[tile.type].push(data);
        $scope.answers[tile.tid] = mockMe(tile);

    }, 500, true);

    // SAVES NEW TILE
    $scope.doSaveTile = function($event, tile){
        if($event) {
            $event.stopPropagation();
        }

        var newTileID = moment().valueOf();

        if(tile.name) {
            tile.type = parseInt(tile.type);

            var tileObject = {
                tid: newTileID,
                name: tile.name,
                type: tile.type,
                interval: parseInt(tile.interval),
                showTime: tile.showTime,
                color: tile.color
            };

            // quota
            if(tile.type === 2) {
                tileObject.quota = parseInt(tile.quota);
                tileObject.axis = tile.axis;
            }

            // binary
            if(tile.type === 3) {
                tileObject.labels = {
                    '1': tile.labels['1'],
                    '-1': tile.labels['-1']
                };
            }

            // scale
            if(tile.type === 4) {
                tileObject.scale = parseInt(tile.scale);
            }

            $scope.tiles.push(tileObject);
            tiles.saveTiles($scope.currentSetKey, $scope.tiles);

            var newTileData = [];
            tiles.saveTileData($scope.currentSetKey, newTileID , newTileData);

            account.updatePreference('tutorial', true);
            $scope.goTo('/main');
        }
    };

    $scope.nextEditorStep = function($event){
        var maxStep = _.max($scope.steps);
        var nextStep = $scope.step + 1;
        nextStep = (nextStep > maxStep) ? maxStep : nextStep;
        if(maxStep === $scope.step) {
            $scope.doSaveTile($event, $scope.tile);
        } else {
            $scope.goToEditorStep(nextStep);
        }
    };

    $scope.prevEditorStep = function(){
        var prevStep = $scope.step - 1;
        prevStep = (prevStep < 1) ? 1 : prevStep;
        $scope.goToEditorStep(prevStep);
    };

    $scope.goToEditorStep = function(step){
        var slide = utils.swipe(step);
        $scope.step = slide.currentIndex+1;
    };

    $scope.closeTutorial = function($event, goto){
        if($scope.step === _.max($scope.steps)) {
            $scope.doSaveTile($event, $scope.tile);
        } else {
            account.updatePreference('tutorial', true);
            $scope.goTo(goto);
        }
    };

    $scope.setTileType = function(id) {
        $scope.currentTile = id;
        $scope.tile = newTiles[id];
    };

}]);
