### Nan::ObjectProtoToString()

A helper method for calling [`v8::Object#ObjectProtoToString()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ab7a92b4dcf822bef72f6c0ac6fea1f0b) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::String> Nan::ObjectProtoToString(v8::Local<v8::Object> obj);
```

<a name="api_nan_has_own_property"></a>
