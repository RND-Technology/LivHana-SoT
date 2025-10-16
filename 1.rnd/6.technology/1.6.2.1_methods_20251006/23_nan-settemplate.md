### Nan::SetTemplate()

Adds properties on an `Object`'s or `Function`'s template.

Signature:

```c++
void Nan::SetTemplate(v8::Local<v8::Template> templ,
                      const char *name,
                      v8::Local<v8::Data> value);
void Nan::SetTemplate(v8::Local<v8::Template> templ,
                      v8::Local<v8::String> name,
                      v8::Local<v8::Data> value,
                      v8::PropertyAttribute attributes)
```

Calls the `Template`'s [`Set()`](https://v8docs.nodesource.com/node-8.16/db/df7/classv8_1_1_template.html#ae3fbaff137557aa6a0233bc7e52214ac).

<a name="api_nan_set_prototype_template"></a>
