/* global angular */
/* global debugChunkLists */


// <editor-fold desc="Chunk 'class' (commented out)">
/* function Chunk(reading) {
    this.uuid = uuid();
    
    this.concat = function(otherChunk) {
        if (this.type && this.type !== otherChunk.type) throw new Error('Can\'t concatenate chunks with differing types ' + this.type + ' and ' + otherChunk.type);
        if (this.title !== otherChunk.title) throw new Error('Can\t concatenate chunks with differing titles ' + this.title + ' and ' + otherChunk.title);
        if (this.type === 'question') throw new Error('Can\'t concatenate question-type chunks');
        if (this.type === 'branch') throw new Error('Concatenating branch-type chunks not implemented');
        
        var result = {
            type: this.type,
            title: this.title,
            items: this.items + otherChunk.items
        };
    };
    
    this.canResultFromRead = function(reading, index) {
        if (reading === undefined) return false;
        if (this.title !== reading.title) return false;
        if (this.options) {
            
        }
    };
    
    if (reading) {
        if (reading.text) {
            this.items = [{
                    text: reading.text
            }];
        }
        if (reading.title) {
            this.title = reading.title;
        }
        if (reading.opts) {
            this.options = [];
            for (var i = 0; i < reading.opts.length; ++i) {
                this.options.push({
                    text: reading.opts[i].str,
                    chunks: [new Chunk()]
                });
            }
        }
        
        if (this.items) {
            if (this.title) {
                this.type = 'speech';
            } else {
                this.type = 'message';
            }
        } else if (this.options) {
            if (this.title) {
                this.type = 'question';
            } else {
                this.type = 'branch';
            }
        } else {
            throw new Error('Can\'t figure out chunk type, as neither text nor options were present');
        }
    } else {
        // TODO: Branches? Maybe something else interesting?
    }
    
}*/
// </editor-fold>

function TranscriberController($interval, $scope, alt1) {
    
    if (!alt1) {
        console.log('Alt1 does not appear to be running, switching to debug mode');
        
        // Initialise chunk list with a debug list
        $scope.chunk = debugChunkLists.testLinear;
   
        // Most of the usual logic isn't relevant here, so we return early.
        return;
    } else {
        $scope.reader = new DialogFullReader();

        $scope.chunk = [];
        $scope.lastRead = null;
        // $scope.currentChonk = new Chunk();
    }
    $scope.updateModel = function() {
        var img = alt1.bindfullrs();
        var foundBox = $scope.reader.find(img);
        
        if (!foundBox) {
            // Do we know the box has vanished, or is it possible to just fail to find it?
            // Do we {{qact}} when the box vanishes? Do we set lastRead to null?
            // TODO
            return;
        }
        
        var read = $scope.reader.read(img);
        if (!read) {
            console.log('Found a dialogue box but failed to read it!');
            // Is this even reachable?
            return;
        }
        
        var newChonk = new Chunk(read);
        
        // TODO: Automatic merge with various eagerness levels
        if ($scope.currentChonk.options) {
            // TODO: Handle options
        } else {
            // TODO: Ask for permission rather than forgiveness?
            try {
                $scope.currentChonk.concat(newChonk);
            } catch (ex) {
                console.log(ex);
                $scope.chunks.push(newChonk);
                $scope.currentChonk = newChonk;
            }
        }
    };
    
    // Maybe remove and wait for it to return
    $scope.interval = $interval($scope.updateModel, 400);
}


angular.module('rs-wiki-transcriber', [])
    //.factory('transcription', ['$interval', '$scope', '$window', TranscriptionServiceFactory])
    .factory('alt1', ['$window', function($window){
        if (!$window.alt1) {
            // Create a dummy alt1 object to access debug functionality.
            $window.alt1 = {
                bindfullrs: function() { return null; },
                mixcolor: function (r, g, b) {},
                events: {
                    alt1pressed: []
                },
                permissionsOverlay: true,
                group: undefined,
                overLayClearGroup: function(g) {console.log('Group', g, 'cleared');},
                overLaySetGroup: function(g) {console.log('Using group ', g); group = g;},
                overLayRect: function(color, x, y, w, h, time, unknown) {console.log('Drew a rectagle');}
            };
        }
        
        return $window.alt1;
    }])
    .controller('transcriber', ['$interval', '$scope', 'alt1', TranscriberController]);