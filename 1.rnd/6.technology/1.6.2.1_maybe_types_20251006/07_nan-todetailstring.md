### Nan::ToDetailString()

A helper method for calling [`v8::Value#ToDetailString()`](https://v8docs.nodesource.com/node-8.16/dc/d0a/classv8_1_1_value.html#a2f9770296dc2c8d274bc8cc0dca243e5) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::String> Nan::ToDetailString(v8::Local<v8::Value> val);
```

<a name="api_nan_to_array_index"></a>
