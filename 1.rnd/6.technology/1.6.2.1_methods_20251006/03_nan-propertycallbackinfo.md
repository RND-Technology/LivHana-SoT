### Nan::PropertyCallbackInfo

`Nan::PropertyCallbackInfo` should be used in place of [`v8::PropertyCallbackInfo`](https://v8docs.nodesource.com/node-8.16/d7/dc5/classv8_1_1_property_callback_info.html), even with older versions of Node where `v8::PropertyCallbackInfo` does not exist.

Definition:

```c++
template<typename T> class PropertyCallbackInfo : public PropertyCallbackInfoBase<T> {
 public:
  ReturnValue<T> GetReturnValue() const;
  v8::Isolate* GetIsolate() const;
  v8::Local<v8::Value> Data() const;
  v8::Local<v8::Object> This() const;
  v8::Local<v8::Object> Holder() const;
};
```

See the [`v8::PropertyCallbackInfo`](https://v8docs.nodesource.com/node-8.16/d7/dc5/classv8_1_1_property_callback_info.html) documentation for usage details on these. See [`Nan::ReturnValue`](#api_nan_return_value) for further information on how to set a return value from property accessor methods.

<a name="api_nan_return_value"></a>
