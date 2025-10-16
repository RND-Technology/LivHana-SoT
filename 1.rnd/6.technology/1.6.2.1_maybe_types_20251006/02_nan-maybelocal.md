### Nan::MaybeLocal

A `Nan::MaybeLocal<T>` is a wrapper around [`v8::Local<T>`](https://v8docs.nodesource.com/node-8.16/de/deb/classv8_1_1_local.html) that enforces a check that determines whether the `v8::Local<T>` is empty before it can be used.

If an API method returns a `Nan::MaybeLocal`, the API method can potentially fail either because an exception is thrown, or because an exception is pending, e.g. because a previous API call threw an exception that hasn't been caught yet, or because a `v8::TerminateExecution` exception was thrown. In that case, an empty `Nan::MaybeLocal` is returned.

Definition:

```c++
template<typename T> class Nan::MaybeLocal {
 public:
  MaybeLocal();

  template<typename S> MaybeLocal(v8::Local<S> that);

  bool IsEmpty() const;

  template<typename S> bool ToLocal(v8::Local<S> *out);

  // Will crash if the MaybeLocal<> is empty.
  v8::Local<T> ToLocalChecked();

  template<typename S> v8::Local<S> FromMaybe(v8::Local<S> default_value) const;
};
```

See the documentation for [`v8::MaybeLocal`](https://v8docs.nodesource.com/node-8.16/d8/d7d/classv8_1_1_maybe_local.html) for further details.

<a name="api_nan_maybe"></a>
