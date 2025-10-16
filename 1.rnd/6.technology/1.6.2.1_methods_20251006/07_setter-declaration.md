### Setter declaration

JavaScript-accessible setters should be declared with the following signature to form a <b><code>Nan::SetterCallback</code></b>:

```c++
typedef void(*SetterCallback)(v8::Local<v8::String>,
                              v8::Local<v8::Value>,
                              const PropertyCallbackInfo<void>&);
```

Example:

```c++
void SetterName(v8::Local<v8::String> property,
                v8::Local<v8::Value> value,
                const Nan::PropertyCallbackInfo<void>& info) {
  ...
}
```

You do not need to declare a new `HandleScope` within a setter as one is implicitly created for you.

A helper macro `NAN_SETTER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on [Accessors](https://v8.dev/docs/embed#accessors).

<a name="api_nan_property_getter"></a>
