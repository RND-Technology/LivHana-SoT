### Property getter declaration

JavaScript-accessible property getters should be declared with the following signature to form a <b><code>Nan::PropertyGetterCallback</code></b>:

```c++
typedef void(*PropertyGetterCallback)(v8::Local<v8::String>,
                                      const PropertyCallbackInfo<v8::Value>&);
```

Example:

```c++
void PropertyGetterName(v8::Local<v8::String> property,
                        const Nan::PropertyCallbackInfo<v8::Value>& info) {
  ...
}
```

You do not need to declare a new `HandleScope` within a property getter as one is implicitly created for you.

A helper macro `NAN_PROPERTY_GETTER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on named property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_property_setter"></a>
