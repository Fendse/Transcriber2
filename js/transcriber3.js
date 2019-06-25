/* global angular */
/* global debugChunkLists */


// <editor-fold defaultstate="collapsed" desc="Very old Chunk 'class' (commented out) {...}">
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


function debugChunks () {
    var debugChunkList = {};
    debugChunkList.testLinear = new LinkedChunk('speech')
        .setTitle('Player')
        .addText("Oh, there's someone here.")
        .addText("Hello there!")
        .setSuccessor(new LinkedChunk('speech')
            .setTitle('Grumpy stranger')
            .addText('Hmph')
            .setSuccessor(new LinkedChunk('message')
                .addText('It looks they don\'t want to talk')
            )
        );

    debugChunkList.testQuestion = new LinkedChunk('speech')
        .setTitle('Player')
        .addText('Hello!')
        .setSuccessor(new LinkedChunk('choice')
            .setTitle('What would you like to say?')
            .addOption('Who are you?', new LinkedChunk('speech')
                .setTitle('Player')
                .addText('Who are you?')
                .setSuccessor(
                    new LinkedChunk('speech')
                    .setTitle('Tim the Wizard')
                    .addText('My name is Tim, I\'m a wizard.')
                    .addText('I was going to be an enchanter, but fire magic is more fun, don\'t you think?')
                )
            )
            .addOption('What are you doing here?', new LinkedChunk('speech')
                .setTitle('Player')
                .addText('What are you doing here?')
                .setSuccessor(new LinkedChunk('speech')
                    .setTitle('Tim the Wizard')
                    .addText('Oh, nothing in particular, just practicing my fire magic.')
                )
            )
        );
    
    return debugChunkList;
}


function TranscriberController($interval, $scope, alt1) {
    
    if (alt1.isDummy) {
        console.log('Alt1 does not appear to be running, switching to debug mode');
        
        // Initialise chunk list with a debug list
        console.log(debugChunks());
        console.log(debugChunks().testLinear);
        $scope.chunk = debugChunks().testLinear;
   
        // Most of the usual logic isn't relevant here, so we return early.
        return;
    } else {
        $scope.reader = new DialogFullReader();

        $scope.chunk = [];
        $scope.childIndex = -1;
        $scope.itemIndex = null;
        $scope.lastRead = null;
        // $scope.currentChonk = new Chunk();
    }
    
    function equalReads (read1, read2) {
        if (read1.title !== read2.title) return false;
        if (read1.text !== read2.text) return false;
        if (!read1.opts) return !read2.opts;
        if (!read2.opts) return false;
        if (read1.opts.length !== read2.opts.length) return false;
        
        for (var i = 0; i < read1.opts.length; ++i) {
            if (read1.opts[i] !== read2.opts[i]) return false;
        }
        
        return true;
    }
    
    $scope.updateModel = function() {
        if (!$scope.reader.find()) {
            // Do we know the box has vanished, or is it possible to just fail to find it?
            // Do we {{qact}} when the box vanishes? Do we set lastRead to null?
            // TODO
            return;
        }
        
        var read = $scope.reader.read();
        if (!read) {
            console.log('Found a dialogue box but failed to read it!');
            // Is this even reachable?
            return;
        }
        
        if (equalReads(read, $scope.lastRead)) return;
        $scope.lastRead = read;
        
        if ($scope.chunk[$scope.childIndex + 1]) {
            /* 
               TODO: The difficult part
               At this point, the chunk we're at already has a successor.
               That makes it kind of tricky to figure out how to best insert
                the new data.
               Sometimes, this involves a new 'branch' chunk, at other times
                we may find the new read is about equivalent to the next chunk
                so we can just move on (the data is in there already).
               If the next chunk is an 'action' chunk (which doesn't show up
                in the chatbox), we can assume the action already happened and
                just move past it.
               If it's a branch, we probably want to add another alternative to
                it, rather than make an all new branch.
               And figuring out when exactly two 'choice' chunks are compatible
                is not quite trivial.
            */
        } else {
            var newChunk;
            if (read.title && read.text && !read.opts) {
                // Speech type
                if (     $scope.chunk.type === 'speech'
                      && read.title === $scope.chunk.originalTitle
                   ) {
                    // Concatenate to existing chunk
                    $scope.chunk.push({text: read.text, originalText: read.text});
                    
                    return;
                } else {
                    newChunk = new ChunkBuilder('speech')
                        .text(read.text)
                        .title(read.title)
                        .build();
                    // Fall through to chunk insertion
                }
            } else if (read.title && !read.text && read.opts) {
                // Choice type
                // Never merge
                var builder = new ChunkBuilder('choice')
                    .title('read.title')
                for (var i = 0; i < read.opts.length; ++i) {
                    builder.option(read.opts[i]);
                }
                newChunk = builder.build();
                // Fall through to chunk insertion
            } else if (!read.title && read.text && !read.opts) {
                // Message type
                if ($scope.chunk.type === 'message') {
                    $scope.chunk.push({text: read.text, originalText: read.text});
                    return;
                } else {
                    newChunk = new ChunkBuilder('message')
                        .text(read.text)
                        .build();
                    // Fall through to chunk insertion
                }
                    
            } else throw Error('Could not make sense of read', read);
            
            
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
                isDummy: true,
                bindfullrs: function() { return null; },
                bindregion: function() { return null; },
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