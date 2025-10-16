### Index enumerator declaration

JavaScript-accessible index enumerator methods should be declared with the following signature to form a <b><code>Nan::IndexEnumeratorCallback</code></b>:

```c++
typedef void(*IndexEnumeratorCallback)(const PropertyCallbackInfo<v8::Array>&);
```

Example:

```c++
void IndexEnumeratorName(const PropertyCallbackInfo<v8::Array>& info);
```

You do not need to declare a new `HandleScope` within a index enumerator as one is implicitly created for you.

A helper macro `NAN_INDEX_ENUMERATOR(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on indexed property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_index_deleter"></a>
