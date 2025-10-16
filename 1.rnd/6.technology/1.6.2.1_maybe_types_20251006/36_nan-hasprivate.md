### Nan::HasPrivate()

A helper method for calling [`v8::Object#HasPrivate()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#af68a0b98066cfdeb8f943e98a40ba08d) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::HasPrivate(v8::Local<v8::Object> object, v8::Local<v8::String> key);
```

<a name="api_nan_get_private"></a>
