function construct ( head, tail ) {
    return cat( [head], _.toArray( tail ) );
}
function cat() {
    var head = _.first( arguments );
    if ( head ) {
        return head.concat.apply( head, _.rest( arguments) );
    }
    return [];
}
function isa( type, action ) {
    return function( obj ) {
        if ( type == obj.type ) {
            return action( obj );
        }
    }
}
function isas( type ) {
    var actions = _.rest( arguments );
    return function( obj ) {
        if ( type == obj.type ) {
            return _.map( actions, function(action){
                return action(obj)
            })
        }
    }
}
function dispatch( /* funs */) {
    var funs = _.toArray( arguments );
    var size = funs.length;
    return function( target /* ,args*/ ) {
        var ret = undefined;
        var args = _.rest( arguments );
        for ( var funIndex = 0; funIndex < size; funIndex++ ) {
            ret = funs[funIndex].apply( null, construct( target, args ) );
            if ( existy( ret ) ) return ret;
        }
        return ret;
    }
}
function existy( obj ) {
    return obj != null;
}
module.exports = {
    cat: cat,
    construct: construct,
    isa : isa,
    isas:  isas,
    dispatch:   dispatch
}
