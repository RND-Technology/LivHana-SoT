### Nan::GetSourceLine()

A helper method for calling [`v8::Message#GetSourceLine()`](https://v8docs.nodesource.com/node-8.16/d9/d28/classv8_1_1_message.html#a849f7a6c41549d83d8159825efccd23a) in a way compatible across supported versions of V8.

Signature:

```c++
Nan::MaybeLocal<v8::String> Nan::GetSourceLine(v8::Local<v8::Message> msg);
```

<a name="api_nan_get_line_number"></a>
