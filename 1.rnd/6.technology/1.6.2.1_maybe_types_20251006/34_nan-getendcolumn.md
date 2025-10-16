### Nan::GetEndColumn()

A helper method for calling [`v8::Message#GetEndColumn()`](https://v8docs.nodesource.com/node-8.16/d9/d28/classv8_1_1_message.html#aaa004cf19e529da980bc19fcb76d93be) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<int> Nan::GetEndColumn(v8::Local<v8::Message> msg);
```

<a name="api_nan_clone_element_at"></a>
