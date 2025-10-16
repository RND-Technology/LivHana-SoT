### Nan::GetPrivate()

A helper method for calling [`v8::Object#GetPrivate()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a169f2da506acbec34deadd9149a1925a) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::GetPrivate(v8::Local<v8::Object> object, v8::Local<v8::String> key);
```

<a name="api_nan_set_private"></a>
