### Nan::DefineOwnProperty()

A helper method for calling [`v8::Object#DefineOwnProperty()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a6f76b2ed605cb8f9185b92de0033a820) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::DefineOwnProperty(v8::Local<v8::Object> obj,
                                        v8::Local<v8::String> key,
                                        v8::Local<v8::Value> value,
                                        v8::PropertyAttribute attribs = v8::None);
```

<a name="api_nan_force_set"></a>
