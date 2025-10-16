### Nan::SetCallHandler()

Set the call-handler callback for a `v8::FunctionTemplate`.
This callback is called whenever the function created from this FunctionTemplate is called.

Signature:

```c++
void Nan::SetCallHandler(v8::Local<v8::FunctionTemplate> templ, Nan::FunctionCallback callback, v8::Local<v8::Value> data = v8::Local<v8::Value>())
```

Calls the `FunctionTemplate`'s [`SetCallHandler()`](https://v8docs.nodesource.com/node-8.16/d8/d83/classv8_1_1_function_template.html#ab7574b298db3c27fbc2ed465c08ea2f8).

<a name="api_nan_set_call_as_function_handler"></a>
