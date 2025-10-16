### Index setter declaration

JavaScript-accessible index setter methods should be declared with the following signature to form a <b><code>Nan::IndexSetterCallback</code></b>:

```c++
typedef void(*IndexSetterCallback)(uint32_t,
                                   v8::Local<v8::Value>,
                                   const PropertyCallbackInfo<v8::Value>&);
```

Example:

```c++
void IndexSetterName(uint32_t index,
                     v8::Local<v8::Value> value,
                     const PropertyCallbackInfo<v8::Value>& info);
```

You do not need to declare a new `HandleScope` within a index setter as one is implicitly created for you.

A helper macro `NAN_INDEX_SETTER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on indexed property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_index_enumerator"></a>
