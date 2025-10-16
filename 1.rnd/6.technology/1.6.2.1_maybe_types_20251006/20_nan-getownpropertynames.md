### Nan::GetOwnPropertyNames()

A helper method for calling [`v8::Object#GetOwnPropertyNames()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a79a6e4d66049b9aa648ed4dfdb23e6eb) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Array> Nan::GetOwnPropertyNames(v8::Local<v8::Object> obj);
```

<a name="api_nan_set_prototype"></a>
