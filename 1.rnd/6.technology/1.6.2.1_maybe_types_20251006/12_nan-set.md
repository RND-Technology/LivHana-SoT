### Nan::Set()

A helper method for calling [`v8::Object#Set()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a67604ea3734f170c66026064ea808f20) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::Set(v8::Local<v8::Object> obj,
                          v8::Local<v8::Value> key,
                          v8::Local<v8::Value> value)
Nan::Maybe<bool> Nan::Set(v8::Local<v8::Object> obj,
                          uint32_t index,
                          v8::Local<v8::Value> value);
```

<a name="api_nan_define_own_property"></a>
