### Nan::SetCallAsFunctionHandler()

Sets the callback to be used when calling instances created from the `v8::ObjectTemplate` as a function.
If no callback is set, instances behave like normal JavaScript objects that cannot be called as a function.

Signature:

```c++
void Nan::SetCallAsFunctionHandler(v8::Local<v8::ObjectTemplate> templ, Nan::FunctionCallback callback, v8::Local<v8::Value> data = v8::Local<v8::Value>())
```

Calls the `ObjectTemplate`'s [`SetCallAsFunctionHandler()`](https://v8docs.nodesource.com/node-8.16/db/d5f/classv8_1_1_object_template.html#a5e9612fc80bf6db8f2da199b9b0bd04e).
