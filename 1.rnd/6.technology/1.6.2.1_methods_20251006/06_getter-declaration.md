### Getter declaration

JavaScript-accessible getters should be declared with the following signature to form a `Nan::GetterCallback`:

```c++
typedef void(*GetterCallback)(v8::Local<v8::String>,
                              const PropertyCallbackInfo<v8::Value>&);
```

Example:

```c++
void GetterName(v8::Local<v8::String> property,
                const Nan::PropertyCallbackInfo<v8::Value>& info) {
  ...
}
```

You do not need to declare a new `HandleScope` within a getter as one is implicitly created for you.

A helper macro `NAN_GETTER(methodname)` exists, compatible with NAN v1 method declarations.

Also see the V8 Embedders Guide documentation on [Accessors](https://v8.dev/docs/embed#accessors).

<a name="api_nan_setter"></a>
