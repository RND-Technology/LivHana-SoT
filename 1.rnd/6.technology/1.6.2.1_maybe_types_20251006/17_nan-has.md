### Nan::Has()

A helper method for calling [`v8::Object#Has()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ab3c3d89ea7c2f9afd08965bd7299a41d) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::Has(v8::Local<v8::Object> obj, v8::Local<v8::String> key);
Nan::Maybe<bool> Nan::Has(v8::Local<v8::Object> obj, uint32_t index);
```

<a name="api_nan_delete"></a>
