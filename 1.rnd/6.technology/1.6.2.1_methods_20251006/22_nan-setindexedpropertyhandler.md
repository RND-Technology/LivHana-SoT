### Nan::SetIndexedPropertyHandler()

Sets indexed property getters, setters, query, deleter and enumerator methods on an `ObjectTemplate`. Accepts:

* Indexed property getters with the `Nan::IndexGetterCallback` signature (see <a href="#api_nan_index_getter">Index getter declaration</a>)
* Indexed property setters with the `Nan::IndexSetterCallback` signature (see <a href="#api_nan_index_setter">Index setter declaration</a>)
* Indexed property query methods with the `Nan::IndexQueryCallback` signature (see <a href="#api_nan_index_query">Index query declaration</a>)
* Indexed property deleters with the `Nan::IndexDeleterCallback` signature (see <a href="#api_nan_index_deleter">Index deleter declaration</a>)
* Indexed property enumerators with the `Nan::IndexEnumeratorCallback` signature (see <a href="#api_nan_index_enumerator">Index enumerator declaration</a>)

Signature:

```c++
void SetIndexedPropertyHandler(v8::Local<v8::ObjectTemplate> tpl,
                               Nan::IndexGetterCallback getter,
                               Nan::IndexSetterCallback setter = 0,
                               Nan::IndexQueryCallback query = 0,
                               Nan::IndexDeleterCallback deleter = 0,
                               Nan::IndexEnumeratorCallback enumerator = 0,
                               v8::Local<v8::Value> data = v8::Local<v8::Value>())
```

See the V8 [`ObjectTemplate#SetIndexedPropertyHandler()`](https://v8docs.nodesource.com/node-8.16/db/d5f/classv8_1_1_object_template.html#ac89f06d634add0e890452033f7d17ff1) for further information about how to use `Nan::SetIndexedPropertyHandler()`.

<a name="api_nan_set_template"></a>
