# boilerplate-ts

This is a minimal `TypeScript` boilerplate that uses `Vite` as its build system.

The motivation behind this was to obtain a clean slate to prototype quick lab experiments without the hassle of configuring a new project but with a specific particularity in mind.

As with any Vite project, files in the `public` directory will be copied to the `dist` directory when building the project. However, the aim of this boilerplate was to produce a build consisting of a single self-contained HTML file with all the project's assets inlined.

That is achieved by a few custom plugins on the `vite.config.ts` configuration, which inlines graphic assets like SVG files into the built JavaScript code. The same is done with other graphic assets' formats like PNG or JPG, however, converting them into a `base64` data string (which will have, as a side-effect, an average of 33% increase in size as a "price paid" to have it inlined into the single HTML file).

The main goal of this particular build method is not to have the tiniest possible build by brushing out all possible bits (like I'd do for demoscene purposes) but to create a small build capable of being executed locally on any machine (just by double-clicking the file and opening it with your favourite/default browser) despite having built-in graphical assets, without relying on any type of local web server while complying with browsers's security policies to load local assets.
