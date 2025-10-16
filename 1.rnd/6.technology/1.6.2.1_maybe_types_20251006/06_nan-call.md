### Nan::Call()

A helper method for calling a synchronous [`v8::Function#Call()`](https://v8docs.nodesource.com/node-8.16/d5/d54/classv8_1_1_function.html#a9c3d0e4e13ddd7721fce238aa5b94a11) in a way compatible across supported versions of V8.

For asynchronous callbacks, use Nan::Callback::Call along with an AsyncResource.

Signature:

```c++
Nan::MaybeLocal<v8::Value> Nan::Call(v8::Local<v8::Function> fun, v8::Local<v8::Object> recv, int argc, v8::Local<v8::Value> argv[]);
Nan::MaybeLocal<v8::Value> Nan::Call(const Nan::Callback& callback, v8::Local<v8::Object> recv,
 int argc, v8::Local<v8::Value> argv[]);
Nan::MaybeLocal<v8::Value> Nan::Call(const Nan::Callback& callback, int argc, v8::Local<v8::Value> argv[]);
```

<a name="api_nan_to_detail_string"></a>
