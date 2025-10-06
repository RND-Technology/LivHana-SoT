// sigh... life is hard
if (!global.console) {
    console = {}
}

const fns = ['log', 'error', 'trace'];
for (let i=0 ; i<fns.length ; ++i) {
    const fn = fns[i];
    if (!console[fn]) {
        console[fn] = function() {};
    }
}

if (!Array.isArray) {
    Array.isArray = require('isarray');
}
