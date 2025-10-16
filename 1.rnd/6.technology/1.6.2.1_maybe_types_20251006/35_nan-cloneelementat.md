### Nan::CloneElementAt()

A helper method for calling [`v8::Array#CloneElementAt()`](https://v8docs.nodesource.com/node-4.8/d3/d32/classv8_1_1_array.html#a1d3a878d4c1c7cae974dd50a1639245e) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Object> Nan::CloneElementAt(v8::Local<v8::Array> array, uint32_t index);
```

<a name="api_nan_has_private"></a>
