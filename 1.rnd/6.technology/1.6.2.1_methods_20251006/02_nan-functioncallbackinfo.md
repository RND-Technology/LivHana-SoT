### Nan::FunctionCallbackInfo

`Nan::FunctionCallbackInfo` should be used in place of [`v8::FunctionCallbackInfo`](https://v8docs.nodesource.com/node-8.16/dd/d0d/classv8_1_1_function_callback_info.html), even with older versions of Node where `v8::FunctionCallbackInfo` does not exist.

Definition:

```c++
template<typename T> class FunctionCallbackInfo {
 public:
  ReturnValue<T> GetReturnValue() const;
  v8::Local<v8::Function> Callee(); // NOTE: Not available in NodeJS >= 10.0.0
  v8::Local<v8::Value> Data();
  v8::Local<v8::Object> Holder();
  bool IsConstructCall();
  int Length() const;
  v8::Local<v8::Value> operator[](int i) const;
  v8::Local<v8::Object> This() const;
  v8::Isolate *GetIsolate() const;
};
```

See the [`v8::FunctionCallbackInfo`](https://v8docs.nodesource.com/node-8.16/dd/d0d/classv8_1_1_function_callback_info.html) documentation for usage details on these. See [`Nan::ReturnValue`](#api_nan_return_value) for further information on how to set a return value from methods.

**Note:** `FunctionCallbackInfo::Callee` is removed in Node.js after `10.0.0` because it is was deprecated in V8. Consider using `info.Data()` to pass any information you need.

<a name="api_nan_property_callback_info"></a>
