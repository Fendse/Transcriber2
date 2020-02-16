/* global angular */

angular.module('rs-wiki-transcriber')
    .directive('chunkList', function() {
        return {
            restrict: 'E',
            scope: {
                chunk: '=chunk'
            },
            templateUrl: 'html/LinkedChunkList.html'
        };
    });