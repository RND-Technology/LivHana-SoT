### Noop Function for Terminating Assertion Properties

The following assertions can now also be used in the function-call form:

* ok
* true
* false
* null
* undefined
* exist
* empty
* arguments
* Arguments

The above list of assertions are property getters that assert immediately on
access. Because of that, they were written to be used by terminating the assertion
chain with a property access.

```js
expect(true).to.be.true;
foo.should.be.ok;
```

This syntax is definitely aesthetically pleasing but, if you are linting your
test code, your linter will complain with an error something like "Expected an
assignment or function call and instead saw an expression." Since the linter
doesn't know about the property getter it assumes this line has no side-effects,
and throws a warning in case you made a mistake.

Squelching these errors is not a good solution as test code is getting to be
just as important as, if not more than, production code. Catching syntactical
errors in tests using static analysis is a great tool to help make sure that your
tests are well-defined and free of typos.

A better option was to provide a function-call form for these assertions so that
the code's intent is more clear and the linters stop complaining about something
looking off. This form is added in addition to the existing property access form
and does not impact existing test code.

```js
expect(true).to.be.true();
foo.should.be.ok();
```

These forms can also be mixed in any way, these are all functionally identical:

```js
expect(true).to.be.true.and.not.false();
expect(true).to.be.true().and.not.false;
expect(true).to.be.true.and.not.false;
```
