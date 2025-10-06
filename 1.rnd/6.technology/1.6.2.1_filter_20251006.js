const path = require('path');
const test = require('tape');
const resolve = require('../');

test('filter', function (t) {
    t.plan(5);
    const dir = path.join(__dirname, 'resolver');
    let packageFilterArgs;
    resolve('./baz', {
        basedir: dir,
        packageFilter: function (pkg, pkgfile, dir) {
            pkg.main = 'doom'; // eslint-disable-line no-param-reassign
            packageFilterArgs = [pkg, pkgfile, dir];
            return pkg;
        }
    }, function (err, res, pkg) {
        if (err) t.fail(err);

        t.equal(res, path.join(dir, 'baz/doom.js'), 'changing the package "main" works');

        const packageData = packageFilterArgs[0];
        t.equal(pkg, packageData, 'first packageFilter argument is "pkg"');
        t.equal(packageData.main, 'doom', 'package "main" was altered');

        const packageFile = packageFilterArgs[1];
        t.equal(
            packageFile,
            path.join(dir, 'baz/package.json'),
            'second packageFilter argument is "pkgfile"'
        );

        const packageFileDir = packageFilterArgs[2];
        t.equal(packageFileDir, path.join(dir, 'baz'), 'third packageFilter argument is "dir"');

        t.end();
    });
});
