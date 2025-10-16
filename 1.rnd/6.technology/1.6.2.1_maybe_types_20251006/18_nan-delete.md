### Nan::Delete()

A helper method for calling [`v8::Object#Delete()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a48e4a19b2cedff867eecc73ddb7d377f) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::Delete(v8::Local<v8::Object> obj,
                             v8::Local<v8::String> key);
Nan::Maybe<bool> Nan::Delete(v8::Local<v8::Object> obj, uint32_t index);
```

<a name="api_nan_get_property_names"></a>
