### Nan::SetAccessor()

Sets getters and setters for a property with a given name on an `ObjectTemplate` or a plain `Object`. Accepts getters with the `Nan::GetterCallback` signature (see <a href="#api_nan_getter">Getter declaration</a>) and setters with the `Nan::SetterCallback` signature (see <a href="#api_nan_setter">Setter declaration</a>).

Signature:

```c++
// The signature parameter was deprecated in Node 16 and subsequently removed
NAN_DEPRECATED void SetAccessor(v8::Local<v8::ObjectTemplate> tpl,
                 v8::Local<v8::String> name,
                 Nan::GetterCallback getter,
                 Nan::SetterCallback setter = 0,
                 v8::Local<v8::Value> data = v8::Local<v8::Value>(),
                 v8::AccessControl settings = v8::DEFAULT,
                 v8::PropertyAttribute attribute = v8::None,
                 imp::Sig signature = imp::Sig());
void SetAccessor(v8::Local<v8::ObjectTemplate> tpl,
                 v8::Local<v8::String> name,
                 Nan::GetterCallback getter,
                 Nan::SetterCallback setter = 0,
                 v8::Local<v8::Value> data = v8::Local<v8::Value>(),
                 v8::AccessControl settings = v8::DEFAULT,
                 v8::PropertyAttribute attribute = v8::None);
bool SetAccessor(v8::Local<v8::Object> obj,
                 v8::Local<v8::String> name,
                 Nan::GetterCallback getter,
                 Nan::SetterCallback setter = 0,
                 v8::Local<v8::Value> data = v8::Local<v8::Value>(),
                 v8::AccessControl settings = v8::DEFAULT,
                 v8::PropertyAttribute attribute = v8::None)
```

See the V8 [`ObjectTemplate#SetAccessor()`](https://v8docs.nodesource.com/node-8.16/db/d5f/classv8_1_1_object_template.html#aca0ed196f8a9adb1f68b1aadb6c9cd77) and [`Object#SetAccessor()`](https://v8docs.nodesource.com/node-8.16/db/d85/classv8_1_1_object.html#ae91b3b56b357f285288c89fbddc46d1b) for further information about how to use `Nan::SetAccessor()`.

<a name="api_nan_set_named_property_handler"></a>
