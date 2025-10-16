### Nan::GetRealNamedProperty()

A helper method for calling [`v8::Object#GetRealNamedProperty()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a84471a824576a5994fdd0ffcbf99ccc0) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::GetRealNamedProperty(v8::Local<v8::Object> obj,
                                                     v8::Local<v8::String> key);
```

<a name="api_nan_call_as_function"></a>
