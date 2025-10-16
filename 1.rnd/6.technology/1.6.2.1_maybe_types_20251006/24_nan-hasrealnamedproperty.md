### Nan::HasRealNamedProperty()

A helper method for calling [`v8::Object#HasRealNamedProperty()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ad8b80a59c9eb3c1e6c3cd6c84571f767) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::HasRealNamedProperty(v8::Local<v8::Object> obj,
                                           v8::Local<v8::String> key);
```

<a name="api_nan_has_real_indexed_property"></a>
