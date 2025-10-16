### Nan::SetMethod()

Sets a method with a given name directly on a JavaScript object where the method has the `Nan::FunctionCallback` signature (see <a href="#api_nan_method">Method declaration</a>).

Signature:

```c++
void Nan::SetMethod(v8::Local<v8::Object> recv,
                    const char *name,
                    Nan::FunctionCallback callback,
                    v8::Local<v8::Value> data = v8::Local<v8::Value>())
void Nan::SetMethod(v8::Local<v8::Template> templ,
                    const char *name,
                    Nan::FunctionCallback callback,
                    v8::Local<v8::Value> data = v8::Local<v8::Value>())
```

<a name="api_nan_set_prototype_method"></a>
