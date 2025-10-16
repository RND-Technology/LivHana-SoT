### Nan::GetPropertyNames()

A helper method for calling [`v8::Object#GetPropertyNames()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#aced885270cfd2c956367b5eedc7fbfe8) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Array> Nan::GetPropertyNames(v8::Local<v8::Object> obj);
```

<a name="api_nan_get_own_property_names"></a>
