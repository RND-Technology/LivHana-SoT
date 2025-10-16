### Nan::CallAsConstructor()

A helper method for calling [`v8::Object#CallAsConstructor()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a50d571de50d0b0dfb28795619d07a01b) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::CallAsConstructor(v8::Local<v8::Object> obj,
                                                  int argc,
                                                  v8::Local<v8::Value> argv[]);
```

<a name="api_nan_get_source_line"></a>
