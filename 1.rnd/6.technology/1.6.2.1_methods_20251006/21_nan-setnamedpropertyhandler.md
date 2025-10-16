### Nan::SetNamedPropertyHandler()

Sets named property getters, setters, query, deleter and enumerator methods on an `ObjectTemplate`. Accepts:

* Property getters with the `Nan::PropertyGetterCallback` signature (see <a href="#api_nan_property_getter">Property getter declaration</a>)
* Property setters with the `Nan::PropertySetterCallback` signature (see <a href="#api_nan_property_setter">Property setter declaration</a>)
* Property query methods with the `Nan::PropertyQueryCallback` signature (see <a href="#api_nan_property_query">Property query declaration</a>)
* Property deleters with the `Nan::PropertyDeleterCallback` signature (see <a href="#api_nan_property_deleter">Property deleter declaration</a>)
* Property enumerators with the `Nan::PropertyEnumeratorCallback` signature (see <a href="#api_nan_property_enumerator">Property enumerator declaration</a>)

Signature:

```c++
void SetNamedPropertyHandler(v8::Local<v8::ObjectTemplate> tpl,
                             Nan::PropertyGetterCallback getter,
                             Nan::PropertySetterCallback setter = 0,
                             Nan::PropertyQueryCallback query = 0,
                             Nan::PropertyDeleterCallback deleter = 0,
                             Nan::PropertyEnumeratorCallback enumerator = 0,
                             v8::Local<v8::Value> data = v8::Local<v8::Value>())
```

See the V8 [`ObjectTemplate#SetNamedPropertyHandler()`](https://v8docs.nodesource.com/node-8.16/db/d5f/classv8_1_1_object_template.html#a33b3ebd7de641f6cc6414b7de01fc1c7) for further information about how to use `Nan::SetNamedPropertyHandler()`.

<a name="api_nan_set_indexed_property_handler"></a>
