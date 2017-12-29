'use strict';

app.factory('TileService', ['$rootScope', 'StorageService', function($rootScope, storage){

    moment.fn.fromNowOrNow = function (a) {
        if (Math.abs(moment().diff(this)) < 5000) { // 5 seconds before or after now
            return 'just now';
        }
        return this.fromNow(a);
    };

    // internal: construct last answer object
    // for a given tile & its supplied dataset
    var getLastAnswer = function(tile, data) {
        if(_.isUndefined(data)) {
            data = [];
        }
        var answer = {};
        var last = _.last(data);
        var timestamp = {since: null, fixed: null};

        if(_.has(last, 'd')){
            timestamp = {
                d: last.d,
                since: moment(last.d).fromNowOrNow(),
                fixed: moment(last.d).format('MMM D @ h:mma')
            };
        }

        switch(tile.type) {
            case 1: // count
                answer = {a: data.length, t: timestamp};
                break;
            case 2: // quota
                var calc = tile.axis === 'down' ? tile.quota - data.length : data.length;
                var percent = calc * 100/tile.quota;
                var cap = percent > 100 ? 100 : (percent < 0 ? 0 : percent);
                answer = {a: calc, b: cap, t: timestamp};
                break;
            case 3: // binary
                answer = _.has(last, 'a') ? {a: tile.labels[last.a], t: timestamp} : {};
                break;
            case 4: // scale
                answer = _.has(last, 'a') ? {a: last.a, t: timestamp} : {};
                break;
            }
        return answer;
    };

    // This is moslty for the extra reporting gunk
    // added to the tiles at reporting runtime
    var sanitizeTileObject = function(tile){
        // for not quotaa
        if(tile.type !== 2) {
            delete tile.quota;
            delete tile.axis;
        }

        // for not binaries
        if(tile.type !== 3) {
            delete tile.labels;
        }

        // for not scales
        if(tile.type !== 4) {
            delete tile.scale;
        }
    };

    var sanitizeTileSet = function(data){
        // clean the tile objects
        _.each(data.tiles, function(tile, index){
            sanitizeTileObject(tile);
        });
    };

    // =====================================================================
    // TILESET FUNCTIONS
    // =====================================================================
    var getTileSet = function(tileSetKey){
        return storage.get('tile-set-' + tileSetKey);
    };

    var saveTileSet = function(tileSetKey, data){
        sanitizeTileSet(data);
        return storage.save('tile-set-' + tileSetKey, data);
    };

    var removeTileSet = function(tileSetKey){
        return storage.remove('tile-set-' + tileSetKey);
    };

    var getTileSetKeys = function(){
        return storage.get('tile-set-keys');
    };

    var saveTileSetKeys = function(tileSetKeys){
        return storage.save('tile-set-keys', tileSetKeys);
    };

    // =====================================================================
    // TILESET PREFERENCE FUNCTIONS
    // =====================================================================
    var getTileSetPreferences = function(tileSetKey){
        return storage.get('tile-set-prefs-' + tileSetKey);
    };

    var saveTileSetPreferences = function(tileSetKey, data){
        return storage.save('tile-set-prefs-' + tileSetKey, data);
    };

    var updateTileSetPreference = function(tileSetKey, key, value){
        var preferences = getTileSetPreferences(tileSetKey);
        preferences[key] = value;
        saveTileSetPreferences(tileSetKey, preferences);
    };

    var defaultTileSetPreferences = function(tileSetKey){
        var preferences = {
            key: tileSetKey,
            charts: []
        };
        saveTileSetPreferences(tileSetKey, preferences);
    };

    // =====================================================================
    // TILESET GET FUNCTIONS
    // =====================================================================
    var getTiles = function(tileSetKey){
        var tileSet = getTileSet(tileSetKey);
        return tileSet.tiles;
    };

    var getTileArchives = function(tileSetKey){
        var tileSet = getTileSet(tileSetKey);
        return tileSet.archives;
    };

    var getTileData = function(tileSetKey, tid){
        var tileSet = getTileSet(tileSetKey);
        return tileSet.data['tile-data-' + tid];
    };

    // =====================================================================
    // TILESET SAVE FUNCTIONS
    // =====================================================================
    var saveTiles = function(tileSetKey, data){
        var tileSet = getTileSet(tileSetKey);
        tileSet.tiles = data;
        saveTileSet(tileSetKey, tileSet);
    };

    var saveTileArchives = function(tileSetKey, data){
        var tileSet = getTileSet(tileSetKey);
        tileSet.archives = data;
        saveTileSet(tileSetKey, tileSet);
    };

    var saveTileData = function(tileSetKey, tid, data){
        var tileSet = getTileSet(tileSetKey);
        tileSet.data['tile-data-' + tid] = data;
        saveTileSet(tileSetKey, tileSet);
    };

    // =====================================================================
    // TILESET REMOVE FUNCTIONS
    // =====================================================================
    var removeTileData = function(tileSetKey, tid){
        var tileSet = getTileSet(tileSetKey);
        tileSet.data['tile-data-' + tid] = [];
        saveTileSet(tileSetKey, tileSet);
    };

    // =====================================================================
    // TILE DATA FUNCTIONS
    // =====================================================================

    var setRandomData = function(tileSetKey){
        var tileSet = getTileSet(tileSetKey);
        _.each(tileSet.tiles,function(tile){
            tileSet.data['tile-data-'+tile.tid] = []; //Clear tile data
            for(var d=0;d<=31;d++){
                var timeStamp = moment().subtract(d,'days').valueOf();
                var numAnswers = tile.type === 2 ? _.random(0, tile.quota) : _.random(0, 12);
                for(var t=0;t<numAnswers;t++){
                    timeStamp--;
                    var dataObj = {'d':timeStamp};
                    switch(tile.type) {
                        case 1: // count
                        case 2: // quota
                            break;
                        case 3: // binary
                            var binary = _.random(0,1);
                            if(binary === 0){
                                binary = -1;
                            }
                            dataObj.a = binary;
                            break;
                        case 4: // scale
                            var scale = _.random($rootScope.scaleTypes[tile.scale].min,$rootScope.scaleTypes[tile.scale].max);
                            dataObj.a = scale;
                            break;
                    }
                    tileSet.data['tile-data-'+tile.tid].push(dataObj);
                }
            }
        });
        saveTileSet(tileSetKey, tileSet);
    };

    // get data for a single tile
    // scope data to answer schedule/timebox (1++), or not (0)
    var getTimeBoxedTileData = function(tileSetKey, tid, timebox){

        var data = getTileData(tileSetKey, tid);
        var boxedData = [];

        if(_.isNull(data) || _.isUndefined(data)) {
            data = [];
            saveTileData(tileSetKey, tid, data);
        } else {

            if(timebox > 0 && data.length) {
                var timeboxObj = $rootScope.timeBoxes[timebox];
                var start = moment().startOf(timeboxObj.unit).valueOf();
                var end = moment().endOf(timeboxObj.unit).valueOf();

                _.each(data, function(entry){
                    if(entry.d > start && entry.d < end) {
                        boxedData.push(entry);
                    }
                });

            }

        }

        return (timebox > 0 ? boxedData : data);
    };

    var getAllTileData = function(tileSetKey, returnFullDataSet){

        var collection = getTiles(tileSetKey);

        var fullDataSet = [];
        var timeboxDataSet = [];
        var fullLastAnswerObj = {};
        var timeboxLastAnswerObj = {};
        var fullNextToLastAnswerObj = {};
        var timeboxNextToLastAnswerObj = {};

        var now = moment();

        returnFullDataSet = returnFullDataSet ? true : false;

        _.each(collection, function(tile){
            var tileCreatedMoment = moment(tile.tid);
            var lastAnswerMoment = now;
            var nextToLastAnswerMoment = now;
            var timeboxLastAnswerMoment = now;
            var timeboxNextToLastAnswerMoment = now;

            var diffTileCreatedToNow = now.diff(tileCreatedMoment, 'minutes');
            var diffLastAnswerToNow = 0;
            var diffNextToLastAnswerToNow = 0;
            var diffTimeboxLastAnswerToNow = 0;
            var diffTimeboxNextToLastAnswerToNow = 0;

            // get all data for a tile
            fullDataSet[tile.tid] = getTileData(tileSetKey, tile.tid);
            if(_.isNull(fullDataSet[tile.tid]) || _.isUndefined(fullDataSet[tile.tid])) {
                fullDataSet[tile.tid] = [];
                saveTileData(tileSetKey, tile.tid, fullDataSet[tile.tid]);
            }

            // get timeboxed data based on tile timeboxing
            timeboxDataSet[tile.tid] = getTimeBoxedTileData(tileSetKey, tile.tid, tile.interval);

            // last answer object from timeboxed data
            timeboxLastAnswerObj = getLastAnswer(tile, timeboxDataSet[tile.tid]) || {};
            // next to last answer object from timeboxed data
            timeboxNextToLastAnswerObj = getLastAnswer(tile, _.initial(timeboxDataSet[tile.tid])) || {};
            // last answer object
            fullLastAnswerObj = getLastAnswer(tile, fullDataSet[tile.tid]) || {};
            // next to last answer object from all data
            fullNextToLastAnswerObj = getLastAnswer(tile, _.initial(fullDataSet[tile.tid])) || {};

            // get moment object from all data last answer timestamp
            // gets x: [_,_|_,_,_|_,x]
            if(_.has(timeboxLastAnswerObj.t, 'd')) {
                timeboxLastAnswerMoment = moment(timeboxLastAnswerObj.t.d);
            }
            // get moment object from next to last all data answer timestamp
            // gets x: [_,_|_,_,_|x,_]
            if(_.has(timeboxNextToLastAnswerObj.t, 'd')) {
                timeboxNextToLastAnswerMoment = moment(timeboxNextToLastAnswerObj.t.d);
            }

            // get moment object from all data last answer timestamp
            // gets x: [_,_,_,_,_,_,x]
            if(_.has(fullLastAnswerObj.t, 'd')) {
                lastAnswerMoment = moment(fullLastAnswerObj.t.d);
            }

            // get moment object from next to last all data answer timestamp
            // gets x: [_,_,_,_,_,x,_]
            if(_.has(fullNextToLastAnswerObj.t, 'd')) {
                nextToLastAnswerMoment = moment(fullNextToLastAnswerObj.t.d);
            }

            // setup some time calc parameters
            diffLastAnswerToNow = now.diff(lastAnswerMoment, 'minutes');
            diffNextToLastAnswerToNow = now.diff(nextToLastAnswerMoment, 'minutes');
            diffTimeboxLastAnswerToNow = now.diff(timeboxLastAnswerMoment, 'minutes');
            diffTimeboxNextToLastAnswerToNow = now.diff(timeboxNextToLastAnswerMoment, 'minutes');

            // the answer to display in tile (timeboxed)
            $rootScope.answers[tile.tid] = timeboxLastAnswerObj;

            // assume no
            $rootScope.answers[tile.tid].editing = false;
            $rootScope.answers[tile.tid].canRewind = false;

            // time rewinder: work hard for yes
            // allow rewinding only for the latest entry, aware of timebox params
            // --------------------------------
            // a) if 1st answer & yes timebox:
            //      can rewind to tile creation OR timebox start
            //      which ever is first
            //
            // b) if nth answer & yes timebox:
            //      can rewind to previous answer OR timebox start
            //      which ever is first
            //
            // c) if 1st answer & no timebox:
            //      can rewind to tile creation
            //
            // d) if nth answer & no timebox:
            //      can rewind to previous answer
            // --------------------------------

            var rewindMax = 0; // minutes
            var rewindContext = false;

            // do we have any answers?
            if(fullDataSet[tile.tid].length > 0) {
                $rootScope.answers[tile.tid].canRewind = true;

                // baseline rewind max
                rewindMax = diffTileCreatedToNow; // minutes
                rewindContext = 'tile creation';

                //  more than one answer in full dataset
                if(fullDataSet[tile.tid].length > 1) {
                    rewindMax = diffNextToLastAnswerToNow;
                    rewindContext = 'last answer';
                }

                // are we timeboxed?
                if(tile.interval > 0) {
                    // timebox startOf catch for only one answer in full dataset
                    var startOfTimeboxMoment = moment().startOf($rootScope.timeBoxes[tile.interval].unit);
                    var diffStartOfTimeboxToNow = now.diff(startOfTimeboxMoment, 'minutes');

                    // do we have more than one answer in timebox?
                    if(timeboxDataSet[tile.tid].length > 0) {
                        rewindMax = diffStartOfTimeboxToNow - diffLastAnswerToNow;
                        rewindContext = 'current timebox';
                        if(timeboxDataSet[tile.tid].length > 1) {
                            //  use previous timeboxed answer
                            rewindMax = diffTimeboxNextToLastAnswerToNow;
                            rewindContext = 'last timebox answer';
                        }
                    } else {
                        $rootScope.answers[tile.tid].canRewind = false;
                    }
                }
            }

            $rootScope.answers[tile.tid].rewindStop = rewindMax;
            $rootScope.answers[tile.tid].rewindContext = rewindContext;
        });

        return (returnFullDataSet ? fullDataSet : timeboxDataSet);
    };


    // =====================================================================
    // RETURN TileService API
    // =====================================================================
    return {
        getLastAnswer: getLastAnswer,
        getTileSet: getTileSet,
        saveTileSet: saveTileSet,
        removeTileSet: removeTileSet,

        getTileSetKeys: getTileSetKeys,
        saveTileSetKeys: saveTileSetKeys,

        getTileSetPreferences: getTileSetPreferences,
        saveTileSetPreferences: saveTileSetPreferences,
        updateTileSetPreference: updateTileSetPreference,
        defaultTileSetPreferences: defaultTileSetPreferences,

        getTiles: getTiles,
        getTileArchives: getTileArchives,
        getTileData: getTileData,
        getTimeBoxedTileData: getTimeBoxedTileData,

        saveTiles: saveTiles,
        saveTileArchives: saveTileArchives,
        saveTileData: saveTileData,
        removeTileData: removeTileData,
        getAllTileData: getAllTileData,

        setRandomData: setRandomData
    };

}]);
