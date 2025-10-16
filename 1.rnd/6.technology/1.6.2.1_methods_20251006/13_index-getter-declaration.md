### Index getter declaration

JavaScript-accessible index getter methods should be declared with the following signature to form a <b><code>Nan::IndexGetterCallback</code></b>:

```c++
typedef void(*IndexGetterCallback)(uint32_t,
                                   const PropertyCallbackInfo<v8::Value>&);
```

Example:

```c++
void IndexGetterName(uint32_t index, const PropertyCallbackInfo<v8::Value>& info);
```

You do not need to declare a new `HandleScope` within a index getter as one is implicitly created for you.

A helper macro `NAN_INDEX_GETTER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on indexed property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_index_setter"></a>
