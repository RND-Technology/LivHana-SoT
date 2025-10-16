### Nan::GetLineNumber()

A helper method for calling [`v8::Message#GetLineNumber()`](https://v8docs.nodesource.com/node-8.16/d9/d28/classv8_1_1_message.html#adbe46c10a88a6565f2732a2d2adf99b9) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::Maybe<int> Nan::GetLineNumber(v8::Local<v8::Message> msg);
```

<a name="api_nan_get_start_column"></a>
