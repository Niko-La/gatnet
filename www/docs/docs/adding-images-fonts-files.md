---
title: "Adding Images, Fonts, and Files"
---

With Webpack you can **`import` a file right in a JavaScript module**. This
tells Webpack to include that file in the bundle. Unlike CSS imports, importing
a file gives you a string value. This value is the final path you can reference
in your code, e.g. as the `src` attribute of an image or the `href` of a link to
a PDF.

To reduce the number of requests to the server, importing images that are less
than 10,000 bytes returns a
[data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
instead of a path. This applies to the following file extensions: svg, jpg,
jpeg, png, gif, mp4, webm, wav, mp3, m4a, aac, and oga.

Here is an example:

```js
import React from "react";
import logo from "./logo.png"; // Tell Webpack this JS file uses this image

console.log(logo); // /logo.84287d09.png

function Header() {
  // Import result is the URL of your image
  return <img src={logo} alt="Logo" />;
}

export default Header;
```

This ensures that when the project is built, Webpack will correctly move the
images into the public folder, and provide us with correct paths.

This works in CSS too:

```css
.Logo {
  background-image: url(./logo.png);
}
```

Webpack finds all relative module references in CSS (they start with `./`) and
replaces them with the final paths from the compiled bundle. If you make a typo
or accidentally delete an important file, you will see a compilation error, just
like when you import a non-existent JavaScript module. The final filenames in
the compiled bundle are generated by Webpack from content hashes. If the file
content changes in the future, Webpack will give it a different name in
production so you don’t need to worry about long-term caching of assets.

Please be advised that this is also a custom feature of Webpack.

Two alternative ways of handling static assets is described in the next sections.

## Query for `File` in GraphQL queries using gatsby-source-filesystem

You can query the `publicURL` field of `File` nodes found in your data layer to trigger copying those files to the public directory and get URLs to them.

Examples:

* Copy all `.pdf` files you have in your data layer to your build directory and return URLs to them:

  ```graphql
  {
    allFile(filter: { extension: { eq: "pdf" } }) {
      edges {
        node {
          publicURL
        }
      }
    }
  }
  ```

* Copy post attachments defined in your Markdown files:

  Link to your attachments in the markdown frontmatter:

  ```markdown
  ---
  title: "Title of article"
attachments:
  - "./assets.zip"
  - "./presentation.pdf"
  ---

  Hi, this is a great article.
  ```

  In the article template component file, you can query for the attachments:

  ```graphql
  query TemplateBlogPost($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        attachments {
          publicURL
        }
      }
    }
  }
  ```

## Using the `static` Folder

### Adding Assets Outside of the Module System

You can also add other assets to a `static` folder at the root of your project.

Note that we normally encourage you to `import` assets in JavaScript files
instead. This mechanism provides a number of benefits:

* Scripts and stylesheets get minified and bundled together to avoid extra
  network requests.
* Missing files cause compilation errors instead of 404 errors for your users.
* Result filenames include content hashes so you don’t need to worry about
  browsers caching their old versions.

However there is an **escape hatch** that you can use to add an asset outside of
the module system.

If you put a file into the `static` folder, it will **not** be processed by
Webpack. Instead it will be copied into the public folder untouched. E.g. if you
add a file named `sun.jpg` to the static folder, it'll be copied to
`public/sun.jpg`. To reference assets in the `static` folder, you'll need to
[import a helper function from `gatsby-link` named `withPrefix`](/packages/gatsby-link/#prefixed-paths-helper).
You will need to make sure
[you set `pathPrefix` in your gatsby-config.js for this to work](/docs/path-prefix/).

```js
import { withPrefix } from 'gatsby-link'

render() {
  // Note: this is an escape hatch and should be used sparingly!
  // Normally we recommend using `import` for getting asset URLs
  // as described in “Adding Images and Fonts” above this section.
  return <img src={withPrefix('/img/logo.png')} alt="Logo" />;
}
```

Keep in mind the downsides of this approach:

* None of the files in `static` folder get post-processed or minified.
* Missing files will not be called at compilation time, and will cause 404
  errors for your users.
* Result filenames won’t include content hashes so you’ll need to add query
  arguments or rename them every time they change.

### When to Use the `static` Folder

Normally we recommend importing [stylesheets](#adding-a-stylesheet),
[images, and fonts](#adding-images-and-fonts) from JavaScript. The `static`
folder is useful as a workaround for a number of less common cases:

* You need a file with a specific name in the build output, such as
  [`manifest.webmanifest`](https://developer.mozilla.org/en-US/docs/Web/Manifest).
* You have thousands of images and need to dynamically reference their paths.
* You want to include a small script like
  [`pace.js`](http://github.hubspot.com/pace/docs/welcome/) outside of the
  bundled code.
* Some library may be incompatible with Webpack and you have no other option but
  to include it as a `<script>` tag.