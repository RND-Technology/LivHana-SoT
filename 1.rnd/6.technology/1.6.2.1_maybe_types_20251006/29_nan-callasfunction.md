### Nan::CallAsFunction()

A helper method for calling [`v8::Object#CallAsFunction()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ad3ffc36f3dfc3592ce2a96bc047ee2cd) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::CallAsFunction(v8::Local<v8::Object> obj,
                                               v8::Local<v8::Object> recv,
                                               int argc,
                                               v8::Local<v8::Value> argv[]);
```

<a name="api_nan_call_as_constructor"></a>
