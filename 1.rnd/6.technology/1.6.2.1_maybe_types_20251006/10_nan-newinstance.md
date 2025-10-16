### Nan::NewInstance()

A helper method for calling [`v8::Function#NewInstance()`](https://v8docs.nodesource.com/node-8.16/d5/d54/classv8_1_1_function.html#ae477558b10c14b76ed00e8dbab44ce5b) and [`v8::ObjectTemplate#NewInstance()`](https://v8docs.nodesource.com/node-8.16/db/d5f/classv8_1_1_object_template.html#ad605a7543cfbc5dab54cdb0883d14ae4) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Object> Nan::NewInstance(v8::Local<v8::Function> h);
Nan::MaybeLocal<v8::Object> Nan::NewInstance(v8::Local<v8::Function> h, int argc, v8::Local<v8::Value> argv[]);
Nan::MaybeLocal<v8::Object> Nan::NewInstance(v8::Local<v8::ObjectTemplate> h);
```

<a name="api_nan_get_function"></a>
