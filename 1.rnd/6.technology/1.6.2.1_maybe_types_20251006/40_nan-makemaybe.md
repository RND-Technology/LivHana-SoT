### Nan::MakeMaybe()

Wraps a `v8::Local<>` in a `Nan::MaybeLocal<>`. When called with a `Nan::MaybeLocal<>` it just returns its argument. This is useful in generic template code that builds on NAN.

Synopsis:

```c++
  MaybeLocal<v8::Number> someNumber = MakeMaybe(New<v8::Number>(3.141592654));
  MaybeLocal<v8::String> someString = MakeMaybe(New<v8::String>("probably"));
```

Signature:

```c++
template <typename T, template <typename> class MaybeMaybe>
Nan::MaybeLocal<T> Nan::MakeMaybe(MaybeMaybe<T> v);
```
