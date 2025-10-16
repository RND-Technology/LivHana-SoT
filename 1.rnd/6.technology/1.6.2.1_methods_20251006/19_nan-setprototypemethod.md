### Nan::SetPrototypeMethod()

Sets a method with a given name on a `FunctionTemplate`'s prototype where the method has the `Nan::FunctionCallback` signature (see <a href="#api_nan_method">Method declaration</a>).

Signature:

```c++
void Nan::SetPrototypeMethod(v8::Local<v8::FunctionTemplate> recv,
                             const char* name,
                             Nan::FunctionCallback callback,
                             v8::Local<v8::Value> data = v8::Local<v8::Value>())
```

<a name="api_nan_set_accessor"></a>
