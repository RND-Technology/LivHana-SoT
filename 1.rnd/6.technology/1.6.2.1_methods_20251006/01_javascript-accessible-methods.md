## JavaScript-accessible methods

A _template_ is a blueprint for JavaScript functions and objects in a context. You can use a template to wrap C++ functions and data structures within JavaScript objects so that they can be manipulated from JavaScript. See the V8 Embedders Guide section on [Templates](https://github.com/v8/v8/wiki/Embedder%27s-Guide#templates) for further information.

In order to expose functionality to JavaScript via a template, you must provide it to V8 in a form that it understands. Across the versions of V8 supported by NAN, JavaScript-accessible method signatures vary widely, NAN fully abstracts method declaration and provides you with an interface that is similar to the most recent V8 API but is backward-compatible with older versions that still use the now-deceased `v8::Argument` type.

* **Method argument types**

* <a href="#api_nan_function_callback_info"><b><code>Nan::FunctionCallbackInfo</code></b></a>
* <a href="#api_nan_property_callback_info"><b><code>Nan::PropertyCallbackInfo</code></b></a>
* <a href="#api_nan_return_value"><b><code>Nan::ReturnValue</code></b></a>

* **Method declarations**

* <a href="#api_nan_method"><b>Method declaration</b></a>
* <a href="#api_nan_getter"><b>Getter declaration</b></a>
* <a href="#api_nan_setter"><b>Setter declaration</b></a>
* <a href="#api_nan_property_getter"><b>Property getter declaration</b></a>
* <a href="#api_nan_property_setter"><b>Property setter declaration</b></a>
* <a href="#api_nan_property_enumerator"><b>Property enumerator declaration</b></a>
* <a href="#api_nan_property_deleter"><b>Property deleter declaration</b></a>
* <a href="#api_nan_property_query"><b>Property query declaration</b></a>
* <a href="#api_nan_index_getter"><b>Index getter declaration</b></a>
* <a href="#api_nan_index_setter"><b>Index setter declaration</b></a>
* <a href="#api_nan_index_enumerator"><b>Index enumerator declaration</b></a>
* <a href="#api_nan_index_deleter"><b>Index deleter declaration</b></a>
* <a href="#api_nan_index_query"><b>Index query declaration</b></a>

* Method and template helpers

* <a href="#api_nan_set_method"><b><code>Nan::SetMethod()</code></b></a>
* <a href="#api_nan_set_prototype_method"><b><code>Nan::SetPrototypeMethod()</code></b></a>
* <a href="#api_nan_set_accessor"><b><code>Nan::SetAccessor()</code></b></a>
* <a href="#api_nan_set_named_property_handler"><b><code>Nan::SetNamedPropertyHandler()</code></b></a>
* <a href="#api_nan_set_indexed_property_handler"><b><code>Nan::SetIndexedPropertyHandler()</code></b></a>
* <a href="#api_nan_set_template"><b><code>Nan::SetTemplate()</code></b></a>
* <a href="#api_nan_set_prototype_template"><b><code>Nan::SetPrototypeTemplate()</code></b></a>
* <a href="#api_nan_set_instance_template"><b><code>Nan::SetInstanceTemplate()</code></b></a>
* <a href="#api_nan_set_call_handler"><b><code>Nan::SetCallHandler()</code></b></a>
* <a href="#api_nan_set_call_as_function_handler"><b><code>Nan::SetCallAsFunctionHandler()</code></b></a>

<a name="api_nan_function_callback_info"></a>
