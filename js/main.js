new Module('main', ['a', 'b'],
    function(args){
        document.querySelector('#result').innerText = `Welcome: ${args.join(' and ')}`
    },
    function(err) {
        document.querySelector('#result').innerText = `OutNo: ${err.toString()}`
    }
)
