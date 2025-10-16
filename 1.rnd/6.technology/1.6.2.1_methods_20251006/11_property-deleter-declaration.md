### Property deleter declaration

JavaScript-accessible property deleters should be declared with the following signature to form a <b><code>Nan::PropertyDeleterCallback</code></b>:

```c++
typedef void(*PropertyDeleterCallback)(v8::Local<v8::String>,
                                       const PropertyCallbackInfo<v8::Boolean>&);
```

Example:

```c++
void PropertyDeleterName(v8::Local<v8::String> property,
                         const Nan::PropertyCallbackInfo<v8::Boolean>& info);
```

You do not need to declare a new `HandleScope` within a property deleter as one is implicitly created for you.

A helper macro `NAN_PROPERTY_DELETER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on named property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_property_query"></a>
