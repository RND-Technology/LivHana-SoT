### Nan::Maybe

A simple `Nan::Maybe` type, representing an object which may or may not have a value, see <https://hackage.haskell.org/package/base/docs/Data-Maybe.html>.

If an API method returns a `Nan::Maybe<>`, the API method can potentially fail either because an exception is thrown, or because an exception is pending, e.g. because a previous API call threw an exception that hasn't been caught yet, or because a `v8::TerminateExecution` exception was thrown. In that case, a "Nothing" value is returned.

Definition:

```c++
template<typename T> class Nan::Maybe {
 public:
  bool IsNothing() const;
  bool IsJust() const;

  // Will crash if the Maybe<> is nothing.
  T FromJust();

  T FromMaybe(const T& default_value);

  bool operator==(const Maybe &other);

  bool operator!=(const Maybe &other);
};
```

See the documentation for [`v8::Maybe`](https://v8docs.nodesource.com/node-8.16/d9/d4b/classv8_1_1_maybe.html) for further details.

<a name="api_nan_nothing"></a>
