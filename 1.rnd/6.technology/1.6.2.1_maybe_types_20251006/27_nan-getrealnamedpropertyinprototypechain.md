### Nan::GetRealNamedPropertyInPrototypeChain()

A helper method for calling [`v8::Object#GetRealNamedPropertyInPrototypeChain()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a8700b1862e6b4783716964ba4d5e6172) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::GetRealNamedPropertyInPrototypeChain(
    v8::Local<v8::Object> obj,
    v8::Local<v8::String> key);
```

<a name="api_nan_get_real_named_property"></a>
