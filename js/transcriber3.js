/* global angular */


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

    var referenceTestChunk = new LinkedChunk('speech')
        .setTitle('Grumpy stranger')
        .addText('None of your business!')
        .addText('I don\'t know you, stop bothering me!');
    debugChunkList.testReferences = new LinkedChunk('choice')
        .setTitle('What would you like to say?')
        .addOption('Who are you?', referenceTestChunk)
        .addOption('What are you doing here?', new LinkedChunk('reference')
            .setTarget(referenceTestChunk)
        );
    
    return debugChunkList;
}


function TranscriberController($interval, $scope, alt1) {
    
    if (alt1.isDummy) {
        console.log('Alt1 does not appear to be running, switching to debug mode');
        
        // Initialise chunk list with a debug list
        $scope.rootChunk = $scope.chunk = debugChunks().testReferences;
        
        $scope.reader = {
            read: function() {
                return null; // TODO better fake
            },
            
            find: function() {
                return false;
            }
        };
    } else {
        $scope.rootChunk = $scope.chunk = null;
        
        $scope.reader = new DialogFullReader();
    }
    $scope.childIndex = -1;
    $scope.itemIndex = null;
    $scope.lastRead = null;

    
    function equalReads (read1, read2) {
        if (!read1) return read1 === read2;
        if (!read2) return false;
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
            // Assume the box is present and unchanged, we just failed to find it
            // It's possible that the box vanished (in which case we might want to {{qact}}
            // TODO
            return;
        }
        
        var read = $scope.reader.read();
        if (!read) {
            console.log('Found a dialogue box but failed to read it!');
            // Is this even reachable?
            return;
        }
        
        if ($scope.waitingForChoice) {
            // TODO: Implement
            console.log('Waiting for user to select an option.');
            return;
        }
        
        if (equalReads(read, $scope.lastRead)) return;
        $scope.lastRead = read;
        
        if ($scope.chunk && $scope.chunk[$scope.childIndex + 1]) {
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
                if (     $scope.chunk
                      && $scope.chunk.type === 'speech'
                      && read.title === $scope.chunk.originalTitle
                   ) {
                    // Concatenate to existing chunk
                    $scope.chunk.addText(read.text);
                    return;
                } else {
                    newChunk = new LinkedChunk('speech')
                        .addText(read.text)
                        .setTitle(read.title);
                    // Fall through to chunk insertion
                }
            } else if (read.title && !read.text && read.opts) {
                // Choice type
                // Never merge
                newChunk = new LinkedChunk('choice')
                    .setTitle('read.title');
                for (var i = 0; i < read.opts.length; ++i) {
                    newChunk.addOption(read.opts[i]);
                }
                // Fall through to chunk insertion
            } else if (!read.title && read.text && !read.opts) {
                // Message type
                if (    $scope.chunk
                     && $scope.chunk.type === 'message'
                   ) {
                    $scope.chunk.addText(read.text);
                    return;
                } else {
                    newChunk = new LinkedChunk('message')
                        .addText(read.text);
                    // Fall through to chunk insertion
                }
                    
            } else throw Error('Could not make sense of read', read);
            
            if (!newChunk) throw Error('New chunk was somehow not initialised from the following read', read);
            if (!$scope.rootChunk) {
                // After launching the app, or clearing the tree
                $scope.rootChunk = $scope.chunk = newChunk;
                return;
            } else if (!$scope.chunk) {
                /*
                 * If we somehow get here, we have no idea where
                 *  in the tree we are. Continuing at this point isn't
                 *  reasonable and would probably break things. So we won't.
                 * The idea is for this to be unreachable, however.
                 */
                throw Error('We somehow got lost');
            } else if (!$scope.chunk.next) {
                    $scope.chunk.next = newChunk;
                    newChunk.prev = $scope.chunk.next;
                    $scope.chunk = newChunk;
            } else {
                throw Error('Conflict resolution not implemented yet');
            }
            // TODO: Insert chunk in a sensible manner
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