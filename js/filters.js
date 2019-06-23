/* global angular */
angular.module('rs-wiki-transcriber')
    .filter('prependSpace', function() {
        return function(input) {
            return ' ' + (input || '');
        };
    })
    .filter('formatText', function() {
        return function(input, showAsCode) {
            return input;
        };
    })
    .filter('formatMessageText', function() {
        return function(input, showAsCode) {
            return input;
        };
    })
    .filter('formatOptionName', function() {
        return function(input, showAsCode) {
            return input;
        };
    })
    .filter('formatBranchCondition', function() {
        return function(input, showAsCode) {
            if (showAsCode) {
                return "''" + input + "''";
            } else return input;
        };
    })
    .filter('formatSpeaker', function() {
        return function(input, showAsCode) {
            if (showAsCode) {
                return "'''" + input + ":'''";
            } else {
                return input + ':';
            }
        }
    })




;