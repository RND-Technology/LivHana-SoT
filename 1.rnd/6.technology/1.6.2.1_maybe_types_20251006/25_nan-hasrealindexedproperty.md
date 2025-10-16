### Nan::HasRealIndexedProperty()

A helper method for calling [`v8::Object#HasRealIndexedProperty()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#af94fc1135a5e74a2193fb72c3a1b9855) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::HasRealIndexedProperty(v8::Local<v8::Object> obj,
                                             uint32_t index);
```

<a name="api_nan_has_real_named_callback_property"></a>
