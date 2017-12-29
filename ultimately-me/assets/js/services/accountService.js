'use strict';

app.factory('AccountService', ['$rootScope', 'StorageService', 'UtilityService', function($rootScope, storage, utils){

    var getPreferences = function(){
        return storage.get('preferences');
    };

    var updatePreference = function(key, value){
        var preferences = getPreferences();
        preferences[key] = value;
        storage.save('preferences', preferences);
    };

    var updatePreferences = function(keys, values){
        var preferences = getPreferences();
        _.each(keys, function(key, index){
            preferences[key] = values[index];
        });
        storage.save('preferences', preferences);
    };

    var setDefaultPreferences = function(){
        storage.save('preferences', {
            dCreated: moment().valueOf(),
            accountKey: utils.createUuid()
        });
    };

    return {
        setDefaultPreferences: setDefaultPreferences,
        getPreferences: getPreferences,
        updatePreference: updatePreference,
        updatePreferences: updatePreferences
    };

}]);
