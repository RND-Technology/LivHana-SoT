### Index deleter declaration

JavaScript-accessible index deleter methods should be declared with the following signature to form a <b><code>Nan::IndexDeleterCallback</code></b>:

```c++
typedef void(*IndexDeleterCallback)(uint32_t,
                                    const PropertyCallbackInfo<v8::Boolean>&);
```

Example:

```c++
void IndexDeleterName(uint32_t index, const PropertyCallbackInfo<v8::Boolean>& info);
```

You do not need to declare a new `HandleScope` within a index deleter as one is implicitly created for you.

A helper macro `NAN_INDEX_DELETER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on indexed property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_index_query"></a>
