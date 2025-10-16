### Property query declaration

JavaScript-accessible property query methods should be declared with the following signature to form a <b><code>Nan::PropertyQueryCallback</code></b>:

```c++
typedef void(*PropertyQueryCallback)(v8::Local<v8::String>,
                                     const PropertyCallbackInfo<v8::Integer>&);
```

Example:

```c++
void PropertyQueryName(v8::Local<v8::String> property,
                       const Nan::PropertyCallbackInfo<v8::Integer>& info);
```

You do not need to declare a new `HandleScope` within a property query method as one is implicitly created for you.

A helper macro `NAN_PROPERTY_QUERY(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on named property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_index_getter"></a>
