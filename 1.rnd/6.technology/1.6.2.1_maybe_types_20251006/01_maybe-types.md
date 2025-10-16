## Maybe Types

The `Nan::MaybeLocal` and `Nan::Maybe` types are monads that encapsulate `v8::Local` handles that _may be empty_.

* **Maybe Types**
  * <a href="#api_nan_maybe_local"><b><code>Nan::MaybeLocal</code></b></a>
  * <a href="#api_nan_maybe"><b><code>Nan::Maybe</code></b></a>
  * <a href="#api_nan_nothing"><b><code>Nan::Nothing</code></b></a>
  * <a href="#api_nan_just"><b><code>Nan::Just</code></b></a>
* **Maybe Helpers**
  * <a href="#api_nan_call"><b><code>Nan::Call()</code></b></a>
  * <a href="#api_nan_to_detail_string"><b><code>Nan::ToDetailString()</code></b></a>
  * <a href="#api_nan_to_array_index"><b><code>Nan::ToArrayIndex()</code></b></a>
  * <a href="#api_nan_equals"><b><code>Nan::Equals()</code></b></a>
  * <a href="#api_nan_new_instance"><b><code>Nan::NewInstance()</code></b></a>
  * <a href="#api_nan_get_function"><b><code>Nan::GetFunction()</code></b></a>
  * <a href="#api_nan_set"><b><code>Nan::Set()</code></b></a>
  * <a href="#api_nan_define_own_property"><b><code>Nan::DefineOwnProperty()</code></b></a>
  * <a href="#api_nan_force_set"><del><b><code>Nan::ForceSet()</code></b></del></a>
  * <a href="#api_nan_get"><b><code>Nan::Get()</code></b></a>
  * <a href="#api_nan_get_property_attribute"><b><code>Nan::GetPropertyAttributes()</code></b></a>
  * <a href="#api_nan_has"><b><code>Nan::Has()</code></b></a>
  * <a href="#api_nan_delete"><b><code>Nan::Delete()</code></b></a>
  * <a href="#api_nan_get_property_names"><b><code>Nan::GetPropertyNames()</code></b></a>
  * <a href="#api_nan_get_own_property_names"><b><code>Nan::GetOwnPropertyNames()</code></b></a>
  * <a href="#api_nan_set_prototype"><b><code>Nan::SetPrototype()</code></b></a>
  * <a href="#api_nan_object_proto_to_string"><b><code>Nan::ObjectProtoToString()</code></b></a>
  * <a href="#api_nan_has_own_property"><b><code>Nan::HasOwnProperty()</code></b></a>
  * <a href="#api_nan_has_real_named_property"><b><code>Nan::HasRealNamedProperty()</code></b></a>
  * <a href="#api_nan_has_real_indexed_property"><b><code>Nan::HasRealIndexedProperty()</code></b></a>
  * <a href="#api_nan_has_real_named_callback_property"><b><code>Nan::HasRealNamedCallbackProperty()</code></b></a>
  * <a href="#api_nan_get_real_named_property_in_prototype_chain"><b><code>Nan::GetRealNamedPropertyInPrototypeChain()</code></b></a>
  * <a href="#api_nan_get_real_named_property"><b><code>Nan::GetRealNamedProperty()</code></b></a>
  * <a href="#api_nan_call_as_function"><b><code>Nan::CallAsFunction()</code></b></a>
  * <a href="#api_nan_call_as_constructor"><b><code>Nan::CallAsConstructor()</code></b></a>
  * <a href="#api_nan_get_source_line"><b><code>Nan::GetSourceLine()</code></b></a>
  * <a href="#api_nan_get_line_number"><b><code>Nan::GetLineNumber()</code></b></a>
  * <a href="#api_nan_get_start_column"><b><code>Nan::GetStartColumn()</code></b></a>
  * <a href="#api_nan_get_end_column"><b><code>Nan::GetEndColumn()</code></b></a>
  * <a href="#api_nan_clone_element_at"><b><code>Nan::CloneElementAt()</code></b></a>
  * <a href="#api_nan_has_private"><b><code>Nan::HasPrivate()</code></b></a>
  * <a href="#api_nan_get_private"><b><code>Nan::GetPrivate()</code></b></a>
  * <a href="#api_nan_set_private"><b><code>Nan::SetPrivate()</code></b></a>
  * <a href="#api_nan_delete_private"><b><code>Nan::DeletePrivate()</code></b></a>
  * <a href="#api_nan_make_maybe"><b><code>Nan::MakeMaybe()</code></b></a>

<a name="api_nan_maybe_local"></a>
