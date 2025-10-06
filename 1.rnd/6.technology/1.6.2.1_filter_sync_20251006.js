const path = require('path');
const test = require('tape');
const resolve = require('../');

test('filter', function (t) {
    const dir = path.join(__dirname, 'resolver');
    let packageFilterArgs;
    const res = resolve.sync('./baz', {
        basedir: dir,
        packageFilter: function (pkg, pkgfile, dir) {
            pkg.main = 'doom'; // eslint-disable-line no-param-reassign
            packageFilterArgs = [pkg, pkgfile, dir];
            return pkg;
        }
    });

    t.equal(res, path.join(dir, 'baz/doom.js'), 'changing the package "main" works');

    const packageData = packageFilterArgs[0];
    t.equal(packageData.main, 'doom', 'package "main" was altered');

    const packageFile = packageFilterArgs[1];
    t.equal(
        packageFile,
        path.join(dir, 'baz/package.json'),
        'second packageFilter argument is "pkgfile"'
    );

    const packageDir = packageFilterArgs[2];
    t.equal(packageDir, path.join(dir, 'baz'), 'third packageFilter argument is "dir"');

    t.end();
});
