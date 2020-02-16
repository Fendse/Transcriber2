/* global angular */

angular.module('rs-wiki-transcriber')
    .directive('editableModel', function($document) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$render = function() {
                    console.log('Rendering with view value', ngModel.$viewValue);
                    var modelValue = ngModel.$viewValue || '';
                    
                    if (attrs.hasFocus) throw Error('This is good, actually');
                    
                    if ( /* element.focus && */ attrs.editableContentFilters) {
                        // TODO
                        console.log('Filtering');
                        var filteredValue = undefined;
                        console.log(attrs.editableContentFilters);
                    }
                    element[0].textContent = filteredValue || modelValue;
                };
                
                element.on('input', function() {
                    console.log('An event happened');
                    scope.$evalAsync(read);
                });
                
                function read() {
                    console.log('Reading contents');
                    var contentData = element[0].textContent;
                    
                    ngModel.$setViewValue(contentData);
                }
                
                attrs['hasFocus'] = false;
                    
                element.on('focus', function() {
                    console.log('Element gained focus. Its attrs are', attrs);
                    attrs['hasFocus'] = true;
                    console.log('After changes, its attrs are', attrs);
                });

                element.on('blur', function() {
                    console.log('Element lost focus, itr attrs are', attrs);
                    attrs['hasFocus'] = false;
                    console.log('After changes, its attrs are', attrs);
                });
            }
        };
    })
    ;