### <del>Nan::ForceSet()</del>

Deprecated, use <a href="#api_nan_define_own_property"><code>Nan::DefineOwnProperty()</code></a>.

<del>A helper method for calling [`v8::Object#ForceSet()`](https://v8docs.nodesource.com/node-0.12/db/d85/classv8_1_1_object.html#acfbdfd7427b516ebdb5c47c4df5ed96c) in a way compatible across supported versions of V8.</del>

Signature:

```c++
NAN_DEPRECATED Nan::Maybe<bool> Nan::ForceSet(v8::Local<v8::Object> obj,
                                              v8::Local<v8::Value> key,
                                              v8::Local<v8::Value> value,
                                              v8::PropertyAttribute attribs = v8::None);
```

<a name="api_nan_get"></a>
