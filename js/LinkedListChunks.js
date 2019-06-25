function LinkedChunk(type) {
    switch (type) {
        case 'speech':
        case 'choice':
        case 'message':
        case 'branch':
        case 'reference':
        case 'action':
        case undefined:
            break;
        default:
            throw Error('Invalid chunk type ' + type);
    }
    
    this.id = uuid();
    this.next = this.prev = null;
    this.type = type;
    
    // Not tested - might not be safe to call
    if (type === undefined) {
        this.setType = function(type) {
            if (type !== undefined) {
                var newChunk = new LinkedChunk(type);
                for (var p in newChunk) {
                    if (p === 'id') continue;
                    this[p] = newChunk[p];
                }
                delete this.setType;
            }
            
            return this;
        };
    }
    
    if (type === 'speech' || type === 'choice') {
        this.setTitle = function(title) {
            this.title = title;
            return this;
        };
    }
    
    if (type === 'choice' || type === 'branch') {
        this.options = [];
        this.addOption = function(text, chunk) {
            var opt = {
                text: text,
                originalText: text,
                firstChunk: chunk || null
            };
            this.options.push(opt);
            return this;
        };
        
        this.addChildToOption = function(optIndex, chunk) {
            if (this.options[optIndex].firstChunk) {
                var cand = this.options[optIndex].firstChunk;
                
                while (cand.next) {
                    cand = cand.next;
                }
            } else {
                this.options[optIndex].firstChunk = chunk;
            }
            return this;
        };
        
        this.setOptionPath = function(optIndex, chunk) {
            this.options[optIndex].firstChunk = chunk;
            
            return this;
        };
    }
    
    if (type === 'speech' || type === 'message' || type === 'action') {
        this.text = [];
        this.addText = function(text) {
            this.text.push({text: text, originalText: text});
            return this;
        };
    }
    
    function insertBetweenNoMerge(predecessor, successor) {
        var backwardsCand = this.chunk;
        
        while (backwardsCand.prev) {
            backwardsCand = backwardsCand.prev;
        }
        
        backwardsCand.prev = predecessor;
        predecessor.next = backwardsCand;
        
        var forwardsCand = this.chunk;
        
        while (forwardsCand.next) {
            forwardsCand = forwardsCand.next;
        }
        
        forwardsCand.next = successor;
        successor.prev = forwardsCand;
        
        return this;
    }
    
    function insertBeforeNoMerge(other) {
        return insertBetweenNoMerge(other.prev, other);
    }
    
    function insertAfterNoMerge(other) {
        return insertBetweenNoMerge(other, other.next);
    }
    
    this.setSuccessor = function(other) {
        this.next = other;
        if (other) other.prev = this;
        
        return this;
    };
    
    this.toJSON = function() {
        var result = {};
        for (var key in this) {
            switch(key) {
                case 'prev':
                    result.prev = this.prev && this.prev.id;
                    break;
                default:
                    result[key] = this[key];
                    break;
            }
        }
        return result;
    };
}