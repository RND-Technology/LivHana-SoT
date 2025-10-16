### Nan::Get()

A helper method for calling [`v8::Object#Get()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a2565f03e736694f6b1e1cf22a0b4eac2) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::Get(v8::Local<v8::Object> obj,
                                    v8::Local<v8::Value> key);
Nan::MaybeLocal<v8::Value> Nan::Get(v8::Local<v8::Object> obj, uint32_t index);
```

<a name="api_nan_get_property_attribute"></a>
