# primrose-tween

> A tiny (~4KB) and versatile tweening library for JavaScript/TypeScript. This library was built to be usable both with Node and for web-based applications.

## Quickstart

To quickly begin using Primrose for web-based applications, clone this repository and add the `primrose.min.js` file to your project. To access the API, simply add the script to the required HTML file.

```html
<script type="text/javascript" src="path/to/primrose.min.js"></script>
```

Otherwise Primrose can be installed via NPM:

```bash
npm install --save primrose-tween
```

And included in a project as needed:

```typescript
import { Primrose } from 'primrose-tween'; // TypeScript
const { Primrose } = require('primrose-tween'); // JavaScript
```

## Functionality

Below is the current functionality for Primrose tweening. Only the `from` and `to` options are required. All instance methods return a reference to the instance so they can be chained from creation. The `auto` factory is highly useful for generating auto-playing tweens, as well as the promisified `create` and `auto` methods.

```typescript
import { Primrose } from 'primrose-tween';

const options = {
    from: { alpha: 0 },     // Initial Values (must be an object reference of numerics) [REQUIRED]
    to: { alpha: 1 },       // Final Values (same as `from`) [REQUIRED]
    duration: 2000,         // Animation Duration (defaulted to 2000ms)
    onUpdate: (val) => {},  // User specified update method where `val` is the current tween values
    onComplete: () => {}    // Callback after tween completion.
};

const instance = Primrose.start(opts); // Tween instance creator.
const autoInst = Primrose.auto(opts); // Pre-started instance.

instance.start(); // Starts the tween if not already started
instance.pause(); // Pauses the tween.
instance.reset(); // Resets the tween to its beginning.
```

## License

Primrose is licensed under the [MIT](https://opensource.org/licenses/MIT) license.