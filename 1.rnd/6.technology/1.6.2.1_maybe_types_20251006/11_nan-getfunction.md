### Nan::GetFunction()

A helper method for calling [`v8::FunctionTemplate#GetFunction()`](https://v8docs.nodesource.com/node-8.16/d8/d83/classv8_1_1_function_template.html#a56d904662a86eca78da37d9bb0ed3705) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::Function> Nan::GetFunction(v8::Local<v8::FunctionTemplate> t);
```

<a name="api_nan_set"></a>
