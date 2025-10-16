### Nan::ToArrayIndex()

A helper method for calling [`v8::Value#ToArrayIndex()`](https://v8docs.nodesource.com/node-8.16/dc/d0a/classv8_1_1_value.html#acc5bbef3c805ec458470c0fcd6f13493) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Uint32> Nan::ToArrayIndex(v8::Local<v8::Value> val);
```

<a name="api_nan_equals"></a>
