### Property setter declaration

JavaScript-accessible property setters should be declared with the following signature to form a <b><code>Nan::PropertySetterCallback</code></b>:

```c++
typedef void(*PropertySetterCallback)(v8::Local<v8::String>,
                                      v8::Local<v8::Value>,
                                      const PropertyCallbackInfo<v8::Value>&);
```

Example:

```c++
void PropertySetterName(v8::Local<v8::String> property,
                        v8::Local<v8::Value> value,
                        const Nan::PropertyCallbackInfo<v8::Value>& info);
```

You do not need to declare a new `HandleScope` within a property setter as one is implicitly created for you.

A helper macro `NAN_PROPERTY_SETTER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on named property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_property_enumerator"></a>
