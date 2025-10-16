### Nan::SetPrototypeTemplate()

Adds properties on an `Object`'s or `Function`'s prototype template.

Signature:

```c++
void Nan::SetPrototypeTemplate(v8::Local<v8::FunctionTemplate> templ,
                               const char *name,
                               v8::Local<v8::Data> value);
void Nan::SetPrototypeTemplate(v8::Local<v8::FunctionTemplate> templ,
                               v8::Local<v8::String> name,
                               v8::Local<v8::Data> value,
                               v8::PropertyAttribute attributes)
```

Calls the `FunctionTemplate`'s _PrototypeTemplate's_ [`Set()`](https://v8docs.nodesource.com/node-8.16/db/df7/classv8_1_1_template.html#a2db6a56597bf23c59659c0659e564ddf).

<a name="api_nan_set_instance_template"></a>
