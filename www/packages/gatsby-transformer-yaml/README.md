# gatsby-transformer-yaml

Parses YAML files. Supports arrays of objects and single objects.

Supported extensions: `.yaml`, `.yml`

Both `.yaml` and `.yml` are treated in the same way. This document uses both of them interchangably.

## Install

`npm install --save gatsby-transformer-yaml`

**Note:** You also need to have `gatsby-source-filesystem` installed and configured so it
points to your files.

## How to use

In your `gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./src/data/`,
      },
    },
  ],
};
```

Where the _source folder_ `./src/data/` contains the `.yaml` files.

## Parsing algorithm

You can choose to structure your data as arrays of objects in individual files
or as single objects spread across multiple files.

The _source folder_ can contain either the following:

* **Array of Objects**: Where each file represents a collection. (_you probably want this one_)
* **Single Object**: Where each _subfolder_ represents a collection; each files represents one "record".

### Array of Objects

The algorithm for YAML arrays is to convert each item in the array into a node.
The type of the node is based on the filename.

So if your project has a `letters.yaml` which looks like:

```yaml
- character: a
- character: b
- character: c
```

Then the following three nodes would be created.

```javascript
[
  {
    character: "a",
  },
  {
    character: "b",
  },
  {
    character: "c",
  },
];
```

### Single Object

The algorithm for single YAML objects is to convert the object defined at the
root of the file into a node. The type of the node is based on the name of the
parent directory.

For example, lets say your project has a data layout like:

```
data/
    letters/
        a.yml
        b.yml
        c.yml
```

Where each of `a.yml`, `b.yml` and `c.yml` look like:

```yaml
character: a
```

```yaml
character: b
```

```yaml
character: c
```

Then the following three nodes would be created.

```javascript
[
  {
    character: "a",
  },
  {
    character: "b",
  },
  {
    character: "c",
  },
];
```

## How to query

You can query the nodes using `GraphQL`, like from the GraphiQL browser: `localhost:8000/___graphql`.

Regardless of whether you choose to structure your data in arrays of objects or
single objects, you'd be able to query your letters like:

```graphql
{
  allLettersYaml {
    edges {
      node {
        character
      }
    }
  }
}
```

Which would return:

```javascript
{
  allLettersYaml: {
    edges: [
      {
        node: {
          character: "a",
        },
      },
      {
        node: {
          character: "b",
        },
      },
      {
        node: {
          character: "c",
        },
      },
    ];
  }
}
```

Please do **note** that `allLettersYaml` **will not** show up if you do not have any `.yaml` files.