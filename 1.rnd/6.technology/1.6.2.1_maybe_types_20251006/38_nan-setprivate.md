### Nan::SetPrivate()

A helper method for calling [`v8::Object#SetPrivate()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ace1769b0f3b86bfe9fda1010916360ee) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::SetPrivate(v8::Local<v8::Object> object, v8::Local<v8::String> key, v8::Local<v8::Value> value);
```

<a name="api_nan_delete_private"></a>
