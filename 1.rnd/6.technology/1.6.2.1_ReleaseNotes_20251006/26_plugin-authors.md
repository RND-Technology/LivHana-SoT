#### Plugin Authors

If you would like to provide this function-call form for your terminating assertion
properties, there is a new function to register these types of asserts. Instead
of using `addProperty` to register terminating assertions, simply use `addChainableNoop`
instead; the arguments to both are identical. The latter will make the assertion
available in both the attribute and function-call forms and should have no impact
on existing users of your plugin.
