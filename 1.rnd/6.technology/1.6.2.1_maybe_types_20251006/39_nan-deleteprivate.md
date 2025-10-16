### Nan::DeletePrivate()

A helper method for calling [`v8::Object#DeletePrivate()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#a138bb32a304f3982be02ad499693b8fd) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<bool> Nan::DeletePrivate(v8::Local<v8::Object> object, v8::Local<v8::String> key);
```

<a name="api_nan_make_maybe"></a>
