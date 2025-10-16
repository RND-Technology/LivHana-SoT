### Index query declaration

JavaScript-accessible index query methods should be declared with the following signature to form a <b><code>Nan::IndexQueryCallback</code></b>:

```c++
typedef void(*IndexQueryCallback)(uint32_t,
                                  const PropertyCallbackInfo<v8::Integer>&);
```

Example:

```c++
void IndexQueryName(uint32_t index, const PropertyCallbackInfo<v8::Integer>& info);
```

You do not need to declare a new `HandleScope` within a index query method as one is implicitly created for you.

A helper macro `NAN_INDEX_QUERY(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on indexed property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_set_method"></a>
