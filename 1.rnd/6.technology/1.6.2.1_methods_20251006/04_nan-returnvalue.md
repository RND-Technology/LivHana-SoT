### Nan::ReturnValue

`Nan::ReturnValue` is used in place of [`v8::ReturnValue`](https://v8docs.nodesource.com/node-8.16/da/da7/classv8_1_1_return_value.html) on both [`Nan::FunctionCallbackInfo`](#api_nan_function_callback_info) and [`Nan::PropertyCallbackInfo`](#api_nan_property_callback_info) as the return type of `GetReturnValue()`.

Example usage:

```c++
void EmptyArray(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  info.GetReturnValue().Set(Nan::New<v8::Array>());
}
```

Definition:

```c++
template<typename T> class ReturnValue {
 public:
  // Handle setters
  template <typename S> void Set(const v8::Local<S> &handle);
  template <typename S> void Set(const Nan::Global<S> &handle);

  // Fast primitive setters
  void Set(bool value);
  void Set(double i);
  void Set(int32_t i);
  void Set(uint32_t i);

  // Fast JS primitive setters
  void SetNull();
  void SetUndefined();
  void SetEmptyString();

  // Convenience getter for isolate
  v8::Isolate *GetIsolate() const;
};
```

See the documentation on [`v8::ReturnValue`](https://v8docs.nodesource.com/node-8.16/da/da7/classv8_1_1_return_value.html) for further information on this.

<a name="api_nan_method"></a>
