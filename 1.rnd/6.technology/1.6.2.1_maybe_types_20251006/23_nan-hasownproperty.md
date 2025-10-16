### Nan::HasOwnProperty()

A helper method for calling [`v8::Object#HasOwnProperty()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ab7b7245442ca6de1e1c145ea3fd653ff) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::HasOwnProperty(v8::Local<v8::Object> obj,
                                     v8::Local<v8::String> key);
```

<a name="api_nan_has_real_named_property"></a>
