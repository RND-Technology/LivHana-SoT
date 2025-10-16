### Migration Requirements

The following changes are required if you are upgrading from the previous version:

* **Users:**
  * _Update [2013-02-04]:_ Some users may notice a small subset of deep equality assertions will no longer pass. This is the result of
  [#120](https://github.com/chaijs/chai/issues/120), an improvement to our deep equality algorithm. Users will need to revise their assertions
  to be more granular should this occur. Further information: [#139](https://github.com/chaijs/chai/issues/139).
* **Plugin Developers:**
  * No changes required.
* **Core Contributors:**
  * Refresh `node_modules` folder for updated developement dependencies.
