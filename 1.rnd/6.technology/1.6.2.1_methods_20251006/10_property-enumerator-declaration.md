### Property enumerator declaration

JavaScript-accessible property enumerators should be declared with the following signature to form a <b><code>Nan::PropertyEnumeratorCallback</code></b>:

```c++
typedef void(*PropertyEnumeratorCallback)(const PropertyCallbackInfo<v8::Array>&);
```

Example:

```c++
void PropertyEnumeratorName(const Nan::PropertyCallbackInfo<v8::Array>& info);
```

You do not need to declare a new `HandleScope` within a property enumerator as one is implicitly created for you.

A helper macro `NAN_PROPERTY_ENUMERATOR(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on named property [Interceptors](https://v8.dev/docs/embed#interceptors).

<a name="api_nan_property_deleter"></a>
