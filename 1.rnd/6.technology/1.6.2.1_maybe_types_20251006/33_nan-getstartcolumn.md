### Nan::GetStartColumn()

A helper method for calling [`v8::Message#GetStartColumn()`](https://v8docs.nodesource.com/node-8.16/d9/d28/classv8_1_1_message.html#a60ede616ba3822d712e44c7a74487ba6) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<int> Nan::GetStartColumn(v8::Local<v8::Message> msg);
```

<a name="api_nan_get_end_column"></a>
