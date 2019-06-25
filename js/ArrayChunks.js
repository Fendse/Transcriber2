/*
 * Either:
 *   Create empty chunk
 *   Create chunk from reading
 *   Create chunk with properties
 * The empty chunk and chunk-with-properties should probably use builders
 *  while the from-reading one could be a proper constructor
 */
function Chunk(reading) {
    if (!reading) {
        
    }
}

function ChunkBuilder(type) {
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
    
    this.chunk = [];
    this.chunk.id = uuid();
    
    if (type === undefined) {
        this.type = function(type) {
            if (type !== undefined) {
                var newBuilder = new ChunkBuilder(type);
                for (var p in newBuilder) {
                    this[p] = newBuilder[p];
                }
                delete this.type;
            }
            
            return this;
        };
    }
    
    if (type === 'speech' || type === 'choice') {
        this.title = function(title) {
            this.chunk.title = title;
            return this;
        };
    }
    
    if (type === 'choice' || type === 'branch') {
        this.option = function(text) {
            var opt = [];
            opt.text = text;
            opt.originalText = text;
            this.chunk.push(opt);
            return this;
        };
        
        this.addChildToOption = function(optIndex, chunk) {
            this.chunk[optIndex].push(chunk);
            return this;
        };
    }
    
    if (type === 'speech' || type === 'message' || type === 'action') {
        this.text = function(text) {
            this.chunk.push({text: text, originalText: text});
            return this;
        };
    }
    
    this.build = function() this.chunk;
    
    return this;
}