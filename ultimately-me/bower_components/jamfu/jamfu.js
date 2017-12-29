(function($angular, $moment, _) {
    'use strict';

    // extend Number to have a nim/max range clipping
    // Number will return no smaller than min, or no larger than max
    var numberClamp = function(min, max) {
        var me = this;
        return Math.min(Math.max(me, min), max);
    };

    // from http://ejohn.org/blog/title-capitalization-in-javascript/
    var titlecase = function(string){
    	var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
    	var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
    	var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;

        var lower = function(word){
    		return word.toLowerCase();
    	};

    	var upper = function(word){
            return word.substr(0,1).toUpperCase() + word.substr(1);
    	};

        /*jshint loopfunc: true */
    	while (true) {
    		var m = split.exec(string);
            var reg1 = new RegExp("\\b" + small + "\\b", "ig");
            var reg2 = new RegExp("^" + punct + small + "\\b", "ig");
            var reg3 = new RegExp("\\b" + small + punct + "$", "ig");

    		parts.push(string.substring(index, m ? m.index : string.length)
    			.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
    				return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
    			})
    			.replace(reg1, lower)
    			.replace(reg2, function(all, punct, word){
    				return punct + upper(word);
    			})
    			.replace(reg3, upper));

    		index = split.lastIndex;

    		if (m) {
                parts.push( m[0] );
            } else {
                break;
            }
    	}

    	return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
    		.replace(/(['Õ])S\b/ig, "$1s")
    		.replace(/\b(AT&T|Q&A)\b/ig, function(all){
    			return all.toUpperCase();
    		});
    };

    var capitalize = function(string) {
        return (string !== null && string.length > 1) ? String(string).charAt(0).toUpperCase() + String(string).substring(1).toLowerCase() : string;
    };

    var uppercase = function(string){
        return (string !== null && string.length) ? String(string).toUpperCase() : string;
    };

    var lowercase = function(string){
        return (string !== null && string.length) ? String(string).toLowerCase() : string;
    };

    var camelcase = function(string){
        if(string !== null && string.length) {
            var mutatedString = string.replace(/\w\S*/g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }).replace(/[\W_]+/g, '');
            return mutatedString.charAt(0).toLowerCase() + mutatedString.substr(1);
        }
        return string;
    };

    var lowernospace = function(string){
        return (string !== null && string.length) ? String(string).toLowerCase().replace(/[\W_]/g, '') : string;
    };

    var lowerdashed = function(string){
        return (string !== null && string.length) ? String(string).toLowerCase().trim().replace(/[\W_]+/g, '-').replace(/^-|-$/g, '') : string;
    };

    var stripTags = function(string) {
        return String(string).replace(/<[^>]+>/gm, '');
    };

    var filesize = function(size, kb1000){
        // turn a string of a number into an interger
        // but don't turn non-numeric strings into intergers
        size = isNaN(size) || _.isEmpty(size) ? size : size*1;

        // bail out if things are still bad.
        if (isNaN(size) || !_.isNumber(size) || size < 0) {
            return '';
        }

        var base = kb1000 ? 1000 : 1024;

        if (size === 0) {
            return '0 bytes'; // instead of 0.00 bytes
        } else if (size < base) {
            return size.toFixed(2) + ' bytes';
        } else if (size < Math.pow(base, 2)) {
            return (Math.round(((size * 100) / base)) / 100) + ' KB';
        } else if (size < Math.pow(base, 3)) {
            return (Math.round(((size * 100) / Math.pow(base, 2))) / 100) + ' MB';
        } else if (size < Math.pow(base, 4)) {
            return (Math.round(((size * 100) / Math.pow(base, 3))) / 100) + ' GB';
        } else if (size < Math.pow(base, 5)) {
            return (Math.round(((size * 100) / Math.pow(base, 4))) / 100) + ' TB';
        } else {
            return (Math.round(((size * 100) / Math.pow(base, 5))) / 100) + ' PB';
        }
    };

    // natural sort algorithm for Javascript - Version 0.7
    // https://github.com/overset/javascript-natural-sort
    var naturalSort = function(a, b) {
        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s; },
            // convert all to strings strip whitespace
            x = i(a).replace(sre, '') || '',
            y = i(b).replace(sre, '') || '',
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
            oFxNcL, oFyNcL;
        // first try and sort Hex codes or Dates
        if (yD) {
            if ( xD < yD ) {
                return -1;
            }
        } else if ( xD > yD ) {
            return 1;
        }
        // natural sorting through split numeric strings and default strings
        for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
            oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) {
                return -1;
            }
            if (oFxNcL > oFyNcL) {
                return 1;
            }
        }
        return 0;
    };

    // extend Array to move an item from old_index to new_index
    var move = function(array, oldIndex, newIndex) {
        if (newIndex >= array.length) {
            var k = newIndex - array.length;
            while ((k--) + 1) {
                array.push(undefined);
            }
        }
        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
        return array;
    };

    // UNDERSCORE THINGS
    _.mixin({clamp: function(min, max) {
        return numberClamp(min, max);
    }});

    _.mixin({titlecase: function(string) {
        return titlecase(string);
    }});

    _.mixin({capitalize: function(string) {
        return capitalize(string);
    }});

    _.mixin({uppercase: function(string) {
        return uppercase(string);
    }});

    _.mixin({lowercase: function(string) {
        return lowercase(string);
    }});

    _.mixin({lowernospace: function(string) {
        return lowernospace(string);
    }});

    _.mixin({lowerdashed: function(string) {
        return lowerdashed(string);
    }});

    _.mixin({camelcase: function(string) {
        return camelcase(string);
    }});

    _.mixin({stripTags: function(string) {
        return stripTags(string);
    }});

    _.mixin({naturalSort: function(obj, value, context) {
        var iterator = _.isFunction(value) ? value : function(obj){ return obj[value]; };
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            return naturalSort(a, b);
        }), 'value');
    }});

    _.mixin({move: function(array, oldIndex, newIndex) {
        return move(array, oldIndex, newIndex);
    }});

    // ANGULAR THINGS
    $angular.module('jamfu', [])

    // DIRECTIVES
    .directive('scrollIn', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            scope: {
                delay: '@scrollDelay'
            },
            link: function(scope, $element, $attrs) {
                var delay = scope.delay ? scope.delay : 0;

                if($($attrs.scrollIn).length && $($attrs.to).length) {
                    $element.on('click', function() { // $event
                        $timeout(function(){
                            $($attrs.scrollIn).scrollTo($($attrs.to), 300);
                        }, delay);
                    });
                }
            }
        };
    }])
    .directive('scrollTo', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            scope: {
                delay: '@scrollDelay'
            },
            link: function(scope, $element, $attrs) {
                var delay = scope.delay ? scope.delay : 0;

                if($($attrs.scrollTo).length) {
                    $element.on('click', function() { // $event
                        $timeout(function(){
                            $element.scrollTo($($attrs.scrollTo), 300);
                        }, delay);
                    });
                }
            }
        };
    }])

    // Font Awesome - from https://github.com/picardy/angular-fontawesome
    .directive('fa', [function () {
        return {
            restrict: 'E',
            template: '<i class="fa"></i>',
            replace: true,
            link: function (scope, element, attrs) {

                /*** STRING ATTRS ***/
                // keep a state of the current attrs so that when they change,
                // we can remove the old attrs before adding the new ones.
                var currentClasses = {};

                // generic function to bind string attrs
                function _observeStringAttr (attr, baseClass) {
                    attrs.$observe(attr, function () {
                        baseClass = baseClass || 'fa-' + attr;
                        element.removeClass(currentClasses[attr]);
                        if (attrs[attr]) {
                            var className = [baseClass, attrs[attr]].join('-');
                            element.addClass(className);
                            currentClasses[attr] = className;
                        }
                    });
                }

                _observeStringAttr('name', 'fa');
                _observeStringAttr('rotate');
                _observeStringAttr('flip');
                _observeStringAttr('stack');

                /**
                 * size can be passed "large" or an integer
                 */
                attrs.$observe('size', function () {
                    var className;
                    element.removeClass(currentClasses.size);

                    if (attrs.size === 'large') {
                        className = 'fa-lg';
                    } else if (!isNaN(parseInt(attrs.size, 10))) {
                        className = 'fa-' + attrs.size + 'x';
                    }

                    element.addClass(className);
                    currentClasses.size = className;
                });

                /**
                 * stack can be passed "large" or an integer
                 */
                attrs.$observe('stack', function () {
                    var className;
                    element.removeClass(currentClasses.stack);

                    if (attrs.stack === 'large') {
                        className = 'fa-stack-lg';
                    } else if (!isNaN(parseInt(attrs.stack, 10))) {
                        className = 'fa-stack-' + attrs.stack + 'x';
                    }

                    element.addClass(className);
                    currentClasses.stack = className;
                });

                /*** BOOLEAN ATTRS ***/
                // generic function to bind boolean attrs
                function _observeBooleanAttr (attr, className) {
                    attrs.$observe(attr, function () {
                        className = className || 'fa-' + attr;
                        var value = attr in attrs && attrs[attr] !== 'false' && attrs[attr] !== false;
                        element.toggleClass(className, value);
                    });
                }

                _observeBooleanAttr('border');
                _observeBooleanAttr('fw');
                _observeBooleanAttr('inverse');
                _observeBooleanAttr('spin');

                /*** CONDITIONAL ATTRS ***/
                    // automatically populate fa-li if DOM structure indicates
                element.toggleClass('fa-li', (
                    element.parent() &&
                    element.parent().parent() &&
                    element.parent().parent().hasClass('fa-ul') &&
                    element.parent().children()[0] === element[0]) &&
                    attrs.list !== 'false' &&
                    attrs.list !== false
                );
            }
        };
    }])
    .directive('faStack', [function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<span ng-transclude class="fa-stack fa-lg"></span>',
            replace: true,
            link: function (scope, element, attrs) {

                /*** STRING ATTRS ***/
                // keep a state of the current attrs so that when they change,
                // we can remove the old attrs before adding the new ones.
                var currentClasses = {};

                // generic function to bind string attrs
                function _observeStringAttr (attr, baseClass) {
                    attrs.$observe(attr, function () {
                        baseClass = baseClass || 'fa-' + attr;
                        element.removeClass(currentClasses[attr]);
                        if (attrs[attr]) {
                            var className = [baseClass, attrs[attr]].join('-');
                            element.addClass(className);
                            currentClasses[attr] = className;
                        }
                    });
                }

                _observeStringAttr('size');

                /**
                 * size can be passed "large" or an integer
                 */
                attrs.$observe('size', function () {
                    var className;
                    element.removeClass(currentClasses.size);

                    if (attrs.size === 'large') {
                        className = 'fa-lg';
                    } else if (!isNaN(parseInt(attrs.size, 10))) {
                        className = 'fa-' + attrs.size + 'x';
                    }

                    element.addClass(className);
                    currentClasses.size = className;
                });
            }
        };
    }])

    // FACTORIES
    .factory('StorageService', [function () {
        // get item out of local storage and if it's a string, turn it into a json object
        var get = function(key) {
            var item = localStorage.getItem(key);
            if (item && _.isString(item) && _.isEmpty(item) === false) {
                return $angular.fromJson(item);
            } else {
                return item;
            }
        };

        // save object as a json string
        var save = function(key, data) {
            localStorage.setItem(key, $angular.toJson(data));
        };
        // remove a specific item
        var remove = function(key) {
            localStorage.removeItem(key);
        };
        // blow them all away
        var clearAll = function() {
            localStorage.clear();
        };

        return {
            get: get,
            save: save,
            remove: remove,
            clearAll: clearAll
        };
    }])

    .factory('UtilityService', [function(){
        var _keyCharList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var _hexCharList = '0123456789ABCDEF';

        var randomString = function(len, chars){
            var result = '';
            for (var i = len; i > 0; --i) {
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return result;
        };

        var createUuid = function(){
            return randomString(12, _keyCharList) + '-' + randomString(12, _keyCharList);
        };

        var isBetween = function(n, a, b){
            if(n > a && n < b) {
                return true;
            }
            return false;
        };

        var randomColor = function(sample){
            if(_.isArray(sample)) {
                return _.sample(sample);
            }
            return false;
        };

        var randomHexColor = function() {
            var hex = '#';
            for (var i = 0; i < 6; i++ ) {
                hex += _hexCharList.charAt(Math.floor(Math.random() * _hexCharList.length));
            }
            return hex;
        };

        var colorBrightness = function(color){
            var r, g, b, brightness;

            if (color.match(/^rgb/)) {
                color = color.match(/rgb\(([^)]+)\)/)[1];
                color = color.split(/ *, */).map(Number);
                r = color[0];
                g = color[1];
                b = color[2];
            } else if ('#' == color[0] && 7 == color.length) {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            } else if ('#' == color[0] && 4 == color.length) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            }

            brightness = (r * 299 + g * 587 + b * 114) / 1000;

            return brightness;
        };

        var numbersArray = function(num, math){
            if(!math) {math = 0;}
            return new Array(num + math);
        };

        var getNumbers = function(target){
            var numbers = {};
            if(target) {
                numbers = {
                    t: target.offsetTop,
                    r: target.offsetLeft + target.offsetWidth,
                    b: target.offsetTop + target.offsetHeight,
                    l: target.offsetLeft,
                    w: target.offsetWidth,
                    h: target.offsetHeight,
                };
                // find x|y center
                numbers.cx = (numbers.l + (numbers.w/2));
                numbers.cy = (numbers.t + (numbers.h/2));
            }
            return numbers;
        };

        var getMetrics = function(el, parent, rtl, factor) {
            rtl = rtl || false;
            factor = factor || false;

            var en = getNumbers(el);
            var pn = getNumbers(parent);

            var p1 = {
                x: en.cx,
                y: en.cy
            };
            var p2 = {
                x: pn.cx,
                y: pn.cy
            };

            // angle in radians
            var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);

            // angle in degrees
            var angleDegrees = angleRadians * 180 / Math.PI;

            if(rtl) {
                // this because if the line's transform-origin is right instead left
                angleDegrees -= 180;
            }

            // length of line between two points
            // last operation as this alters the number set
            var lineLength = Math.sqrt(((p1.x -= p2.x) * p1.x) + ((p1.y -= p2.y) * p1.y));

            if(factor) {
                lineLength = lineLength*factor;
            }

            return {
                lineLength: lineLength,
                angleRadians: angleRadians,
                angleDegrees: angleDegrees
            };
        };

        var findDeep = function(collection, id, found, action) {
            found = found || {item: undefined, parentIds: []};

            var item;
            item = _.find(collection, function(cell, index) {
                return cell.id === id;
            });
            if (item) {
                found.item = $angular.copy(item);
                found.parentIds = [];

                // doing this here because this is in the right nest right now
                if(action === 'remove') {
                    var index = collection.indexOf(id);
                    if(index > -1) {
                        collection.splice(index, 1);
                    }
                }

            } else {
                // if no match is found, search one level deeper for each item
                for (var i = 0; i < collection.length; i++) {
                    item = collection[i];
                   if (!_.isEmpty(item.children)) {
                        found = findDeep(item.children, id, found, action);
                        if (found.item !== undefined) {
                            found.parentIds.unshift(item.id);
                            break;
                        }
                    }
                }
            }
            return found;
        };

        var swipe = function(step, selector) {
            step = step || 1;
            selector = selector || '.swiper';

            var dirProp = function(direction, hProp, vProp) {
                return (direction && Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
            };

            var HammerCarousel = function(container, direction) {
                this.container = container;
                this.direction = direction;
                this.panes = Array.prototype.slice.call(this.container.children, 0);
                this.containerSize = this.container[dirProp(direction, 'offsetWidth', 'offsetHeight')];
                this.currentIndex = step-1;
                this.hammer = new Hammer.Manager(this.container);
                // this.hammer.add(new Hammer.Pan({ direction: this.direction, threshold: 10 }));
                // this.hammer.add(new Hammer.Pan());
                this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(_.throttle(this.onPan, 100), this));
                this.show(this.currentIndex);
            };

            HammerCarousel.prototype = {
                show: function (showIndex, percent) {
                    showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
                    percent = percent || 0;

                    var paneIndex, pos, translate;

                    for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
                        pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
                        translate = 'translate3d(' + pos + 'px, 0, 0)';
                        this.panes[paneIndex].style.transform = translate;
                        this.panes[paneIndex].style.mozTransform = translate;
                        this.panes[paneIndex].style.webkitTransform = translate;
                    }

                    this.currentIndex = showIndex;
                },

                onPan: function (ev) {
                    var delta = dirProp(this.direction, ev.deltaX, ev.deltaY);
                    var percent = (100 / this.containerSize) * delta;

                    if (ev.type === 'panend' || ev.type === 'pancancel') {
                        if (Math.abs(percent) > 20 && ev.type === 'panend') {
                            this.currentIndex += (percent < 0) ? 1 : -1;
                        }
                        percent = 0;
                    }

                    this.show(this.currentIndex, percent);
                }
            };

            var outer = new HammerCarousel(window.document.querySelector(selector), Hammer.DIRECTION_HORIZONTAL);
            return outer;
        };

        var deviceReady = function(fn){
            if (typeof window.cordova === 'object') {
                document.addEventListener('deviceready', function () {
                    fn();
                }, false);
            } else {
                fn();
            }
        };

        var deviceResume = function(fn){
            if (typeof window.cordova === 'object') {
                deviceReady(function() {
                    document.addEventListener('resume', function() {
                        fn();
                    }, false);
                });
            } else {
                fn();
            }
        };

        var devicePause = function(fn){
            if (typeof window.cordova === 'object') {
                deviceReady(function() {
                    document.addEventListener('pause', function() {
                        fn();
                    }, false);
                });
            } else {
                fn();
            }
        };

        return {
            randomString: randomString,
            createUuid: createUuid,
            isBetween: isBetween,
            randomColor: randomColor,
            randomHexColor: randomHexColor,
            colorBrightness: colorBrightness,
            numbersArray: numbersArray,
            getNumbers: getNumbers,
            getMetrics: getMetrics,
            findDeep: findDeep,
            swipe: swipe,
            deviceReady: deviceReady,
            deviceResume: deviceResume,
            devicePause: devicePause
        };

    }])

    // FILTERS
    .filter('titlecase', function() {
        return function(string) {
            return titlecase(string);
        };
    })

    .filter('capitalize', function() {
        return function(string) {
            return capitalize(string);
        };
    })

    .filter('uppercase', function(){
        return function(string) {
            return uppercase(string);
        };
    })

    .filter('lowercase', function(){
        return function(string) {
            return lowercase(string);
        };
    })

    .filter('lowernospace', function(){
        return function(string) {
            return lowernospace(string);
        };
    })

    .filter('lowerdashed', function(){
        return function(string) {
            return lowerdashed(string);
        };
    })

    .filter('camelcase', function(){
        return function(string) {
            return camelcase(string);
        };
    })

    .filter('stripTags', function() {
        return function(string) {
            return stripTags(string);
        };
    })

    .filter('filesize', function(){
        return function(size, kb1000){
            return filesize(size, kb1000);
        };
    })


    // accepts a long number or a valid string.
    // undefined, 0, '0', or negative number is treated as invalid and therefore returns '0'.
    .filter('momentformat', function() {
        return function(dateString, format) {
            var str = '';
            if (!_.isUndefined(dateString) && dateString > 0 && dateString !== '0' && $moment(dateString).isValid()) {
                str = $moment(dateString).format(format);
            }
            return str;
        };
    })

     // accepts a valid string and returns Moment.fromNow().
    .filter('momentfromnow', function() {
        return function(dateString) {
            var str = '';
            if (!_.isUndefined(dateString) && dateString > 0 && dateString !== '0' && $moment(dateString).isValid()) {
                str = $moment(dateString).fromNow();
            }
            return str;
        };
    });

})(window.angular, window.moment, window._);
