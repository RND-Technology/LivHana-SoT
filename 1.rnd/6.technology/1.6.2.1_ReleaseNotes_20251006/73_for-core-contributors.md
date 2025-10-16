#### For Core Contributors

**1. Browser Testing**: Browser testing of the `./chai.js` file is now available in the command line
via PhantomJS. `make test` and Travis-CI will now also rebuild and test `./chai.js`. Consequently, all
pull requests will now be browser tested in this way.

_Note: Contributors opening pull requests should still NOT include the browser build._

**2. SauceLabs Testing**: Early SauceLab support has been enabled with the file `./support/mocha-cloud.js`.
Those interested in trying it out should create a free [Open Sauce](https://saucelabs.com/signup/plan) account
and include their credentials in `./test/auth/sauce.json`.
