### Nan::HasRealNamedCallbackProperty()

A helper method for calling [`v8::Object#HasRealNamedCallbackProperty()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#af743b7ea132b89f84d34d164d0668811) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::HasRealNamedCallbackProperty(
    v8::Local<v8::Object> obj,
    v8::Local<v8::String> key);
```

<a name="api_nan_get_real_named_property_in_prototype_chain"></a>
