new Module('b', ['a'],
    function(args){
        return `${args[0]}’s father`
    },
    function(err) {
        return `module b is error -- ${err.toString()}`
    }
)
