### Nan::SetPrototype()

A helper method for calling [`v8::Object#SetPrototype()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a442706b22fceda6e6d1f632122a9a9f4) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::SetPrototype(v8::Local<v8::Object> obj,
                                   v8::Local<v8::Value> prototype);
```

<a name="api_nan_object_proto_to_string"></a>
