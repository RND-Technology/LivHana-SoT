### Method declaration

JavaScript-accessible methods should be declared with the following signature to form a `Nan::FunctionCallback`:

```c++
typedef void(*FunctionCallback)(const FunctionCallbackInfo<v8::Value>&);
```

Example:

```c++
void MethodName(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  ...
}
```

You do not need to declare a new `HandleScope` within a method as one is implicitly created for you.

**Example usage**

```c++
// .h:
class Foo : public Nan::ObjectWrap {
  ...

  static void Bar(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void Baz(const Nan::FunctionCallbackInfo<v8::Value>& info);
}


// .cc:
void Foo::Bar(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  ...
}

void Foo::Baz(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  ...
}
```

A helper macro `NAN_METHOD(methodname)` exists, compatible with NAN v1 method declarations.

**Example usage with `NAN_METHOD(methodname)`**

```c++
// .h:
class Foo : public Nan::ObjectWrap {
  ...

  static NAN_METHOD(Bar);
  static NAN_METHOD(Baz);
}


// .cc:
NAN_METHOD(Foo::Bar) {
  ...
}

NAN_METHOD(Foo::Baz) {
  ...
}
```

Use [`Nan::SetPrototypeMethod`](#api_nan_set_prototype_method) to attach a method to a JavaScript function prototype or [`Nan::SetMethod`](#api_nan_set_method) to attach a method directly on a JavaScript object.

<a name="api_nan_getter"></a>
