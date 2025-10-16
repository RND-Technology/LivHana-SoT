### `container` Array iterators

The container class provides proxies to certain Array methods; these are:

* `container.map === container.nodes.map`
* `container.reduce === container.nodes.reduce`
* `container.every === container.nodes.every`
* `container.some === container.nodes.some`
* `container.filter === container.nodes.filter`
* `container.sort === container.nodes.sort`

Note that these methods only work on a container's immediate children; recursive
iteration is provided by `container.walk`.
