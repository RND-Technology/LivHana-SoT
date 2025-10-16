### Nan::GetPropertyAttributes()

A helper method for calling [`v8::Object#GetPropertyAttributes()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a9b898894da3d1db2714fd9325a54fe57) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<v8::PropertyAttribute> Nan::GetPropertyAttributes(
    v8::Local<v8::Object> obj,
    v8::Local<v8::Value> key);
```

<a name="api_nan_has"></a>
