### Nan::Equals()

A helper method for calling [`v8::Value#Equals()`](https://v8docs.nodesource.com/node-8.16/dc/d0a/classv8_1_1_value.html#a08fba1d776a59bbf6864b25f9152c64b) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::Equals(v8::Local<v8::Value> a, v8::Local<v8::Value>(b));
```

<a name="api_nan_new_instance"></a>
