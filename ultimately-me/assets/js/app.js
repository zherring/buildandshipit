'use strict';

var moduleDependencies = [
    //ng modules
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'ngSanitize',
    'as.sortable',
    'angular-gestures',
    'jamfu'
    // 'angulartics',
    // 'angulartics.google.analytics'
];

/*global app: true*/
var app = angular.module('ultme', moduleDependencies);

app.config(function($routeProvider, hammerDefaultOptsProvider) {
    $routeProvider
    // route for the main screen
    .when('/', {
        templateUrl : 'views/splash.html',
        controller  : 'splashController',
        view   : 'splash'
    })
    .when('/main', {
        templateUrl : 'views/main.html',
        controller  : 'mainController',
        view   : 'main'
    })
    .when('/add', {
        templateUrl : 'views/tile-add.html',
        controller  : 'tileAddEditController',
        view   : 'add'
    })
    .when('/tips', {
        templateUrl : 'views/tips.html',
        controller  : 'tipsController',
        view   : 'tips'
    })
    .when('/edit/:tid', {
        templateUrl : 'views/tile-edit.html',
        controller  : 'tileAddEditController',
        view   : 'edit'
    })

    .when('/account', {
        templateUrl : 'views/account.html',
        controller  : 'accountController',
        view   : 'account'
    })

    .when('/about', {
        templateUrl : 'views/about.html',
        controller  : 'aboutController',
        view   : 'about'
    })

    .when('/tutorial', {
        templateUrl : 'views/tutorial.html',
        controller  : 'tutorialController',
        view   : 'tutorial'
    })

    .when('/archive', {
        templateUrl : 'views/archive.html',
        controller  : 'archiveController',
        view   : 'archive'
    })

    .when('/report', {
        templateUrl : 'views/report.html',
        controller  : 'reportController',
        view   : 'report'
    })
    .when('/report/:tid/details', {
        templateUrl : 'views/report-details.html',
        controller  : 'reportDetailsController',
        view   : 'report-details'
    })

    // catch all redirect to main
    .otherwise({
        redirectTo: '/'
    });

    hammerDefaultOptsProvider.set({
        recognizers: [
            [Hammer.Press, {time: 800}]
        ]
    });

});

app.run(['$rootScope', '$route', '$location', 'UtilityService', function($rootScope, $route, $location, utils){

    // anything a view needs to call
    $rootScope.goTo = function(uri, slide){
        $location.url(uri);
        $rootScope.slide = slide || 'RL';
    };

    $rootScope.tileTypes = {
        // 0: {name: 'blank', nickname: 'null', description: 'This is a placeholder tile with no info/data.'},
        1: {name: 'count', nickname: 'Count', charts: [1,2,4], description: 'The most basic tile. Tap to increase the count. This tile will keep track of counting things -- like cups of coffee or water, or whatever.'},
        2: {name: 'quota', nickname: 'Quota', charts: [2,4,1], description: 'This works like a Count Tile but with a goal or limit that that can be set to count down or up to your goal.'},
        3: {name: 'binary', nickname: 'Question', charts: [3,1,2], description: 'With this handy tile, you can to choose between two answers -- like Yes or No, This or That. Tap an option to record an answer. Tap the result if you want to answer the question again.'},
        4: {name: 'scale', nickname: 'Slider', charts: [4,1,2], description: 'Rate things! Use a slider to choose a rating from -5 to 5, or from 0 to 10. Tap an option to record an answer. Tap the result if you want to answer the question again.'}
    };

    $rootScope.chartTypes = {
        1: {name: 'units', nickname: 'Units'},
        2: {name: 'bars', nickname: 'Bars'},
        3: {name: 'stacked', nickname: 'Stacked'},
        4: {name: 'line', nickname: 'Line'}
    };

    $rootScope.timeBoxes = {
        1: {name: 'Hourly', unit: 'hour'},
        2: {name: 'Daily', unit: 'day'},
        3: {name: 'Weekly', unit: 'week'},
        4: {name: 'Monthly', unit: 'month'}
    };

    $rootScope.scaleTypes = {
        1: {name: '-5 to 5', min: -5, max: 5, start: 0},
        2: {name: '0 to 10', min: 0, max: 10, start: 5},
    };

    $rootScope.tileSetThemes = [
        {id: 'dark', name: 'Dark'},
        {id: 'light', name: 'Light'},
        {id: 'ios', name: 'iOS'}
    ];

    $rootScope.colors = [1,2,3,4,5,6,7,8,9];

    // default tiles definition
    $rootScope.defaultTiles = [
        {tid:0,name:'Cups of Water',type:1,chart:1,interval:2,showTime:'since',color:1,quota:8,axis:'up'},
        {tid:0,name:'My Mood?',type:4,chart:4,interval:1,showTime:'since',color:6,scale:1}
    ];
    // no default tiles option
    $rootScope.defaultTiles = [];

    // report durations
    $rootScope.reportDayRange = {
        'week': _.range(0, -7, -1),
        'month': _.range(0, -31, -1)
    };

    $rootScope.getNumber = function(num, math){
      return utils.numbersArray(num, math);
    };

    $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
        $rootScope.view = currRoute.view;
    });

}]);

app.controller('appController', ['$rootScope', '$scope', '$templateCache', '$http', '$location', '$timeout', '$filter', 'StorageService', 'UtilityService', 'AccountService', 'TileService', function($rootScope, $scope, $templateCache, $http, $location, $timeout, $filter, storage, utils, account, tiles){

    $scope.doMenuLink = function(path, slide){
        if(path === $scope.currentPath) {
            $scope.toggleMenu();
        } else {
            $rootScope.goTo(path, slide);
        }
    };

    $scope.toggleMenu = function(){
        $scope.openMenu = !$scope.openMenu;
    };

    $scope.toggleManageTilesets = function(){
        $scope.manageTilesets = !$scope.manageTilesets;
    };

    $scope.ripple = function($event, target, timeout) {
        timeout = timeout || 600;
        target = !_.isUndefined(target) ? $($event.target).closest(target) : $($event.target);

        target.addClass('ripple');
        $timeout(function(){
            target.removeClass('ripple');
        }, timeout);
    };

    var setupDefaultTileSet = function(){
        var defaultTiles = $rootScope.defaultTiles;
        if(defaultTiles.length > 0) {
            var now = moment();
            defaultTiles = _.each(defaultTiles, function(item){
                item.tid = now.add(1, 'ms').valueOf();
            });
        }
        $scope.currentTileSet.tiles = defaultTiles;
        $scope.currentTileSet.data = {};
        $scope.currentTileSet.archives = [];
    };

    $scope.init = function(){
        $scope.openMenu = false;
        $rootScope.answers = [];
        $scope.undo = [];
        $scope.now = moment();
        $scope.nowPretty = $scope.now.format('dddd, MMMM Do');
        $scope.currentPath = $location.path();

        $scope.tileSetKeys = tiles.getTileSetKeys();

        // init preferences object
        $scope.preferences = account.getPreferences();

        if(_.isNull($scope.preferences)) {
            account.setDefaultPreferences();
            $scope.preferences = account.getPreferences();
        }

        if(_.isUndefined($scope.preferences.accountKey)) {
            account.updatePreference('accountKey', utils.createUuid());
        }

        //init tileset object
        if(_.isNull($scope.tileSetKeys)) {
            $scope.currentSetKey = utils.createUuid();
            $scope.tileSetKeys = [$scope.currentSetKey];
            tiles.saveTileSetKeys($scope.tileSetKeys);

            $scope.currentTileSet = {};
            $scope.currentTileSet.key = $scope.currentSetKey;
            $scope.currentTileSet.preferences = {};
            $scope.currentTileSet.settings = {};

            setupDefaultTileSet();

            tiles.saveTileSet($scope.currentSetKey, $scope.currentTileSet);
        }

        // HACK: hard-setting to the first key in tileSetKeys collection
        // TODO: when multiple tiles sets and cloudsync is ready (?), fix this.
        $scope.currentSetKey = $scope.tileSetKeys[0];
        // HACK: END

        $scope.currentTileSet = tiles.getTileSet($scope.currentSetKey);
        $scope.tiles = $scope.currentTileSet.tiles;

        $scope.archives = $scope.currentTileSet.archives;
        $scope.tileData = tiles.getAllTileData($scope.currentSetKey, false);

        $scope.tileSetPreferences = tiles.getTileSetPreferences($scope.currentSetKey);
        if(_.isNull($scope.tileSetPreferences)) {
            tiles.defaultTileSetPreferences($scope.currentSetKey);
            $scope.tileSetPreferences = tiles.getTileSetPreferences($scope.currentSetKey);
        }
    };

    $scope.updatePreference = function(key, value){
        account.updatePreference(key, value);
    };

    // catch app resuming and flash the tiles
    // var onResume = function(){
    //     $scope.init();
    // };
    //
    // utils.deviceResume(onResume);

}]);


app.filter('emojify', function() {

    var escapeRegExp = function(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    var replaceAll = function(string, find, replace) {
        return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    };

    return function(text) {
        if(text && text.length) {
            text = replaceAll(text, ':)', '<i class="fa fa-smile-o"></i>');
            text = replaceAll(text, ':-)', '<i class="fa fa-smile-o"></i>');
            text = replaceAll(text, ':(', '<i class="fa fa-frown-o"></i>');
            text = replaceAll(text, ':-(', '<i class="fa fa-frown-o"></i>');
            text = replaceAll(text, ':|', '<i class="fa fa-meh-o"></i>');
            text = replaceAll(text, ':-|', '<i class="fa fa-meh-o"></i>');
            text = replaceAll(text, '<3', '<i class="fa fa-heart"></i>');
            text = replaceAll(text, '(<3)', '<i class="fa fa-heart-o"></i>');
            text = replaceAll(text, '(y)', '<i class="fa fa-thumbs-o-up"></i>');
            text = replaceAll(text, '(n)', '<i class="fa fa-thumbs-o-down"></i>');
            text = replaceAll(text, ':n:', '<i class="fa fa-thumbs-down"></i>');
            text = replaceAll(text, ':y:', '<i class="fa fa-thumbs-up"></i>');
            text = replaceAll(text, ':*:', '<i class="fa fa-star"></i>');
            text = replaceAll(text, '(*)', '<i class="fa fa-star-o"></i>');
        }
        return text;
    };
});
