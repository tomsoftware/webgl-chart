# Drawing Texts

Texts can be rendered using the `GpuText` and `GpuLetterText` classes. Internally, all texts are treated as textures, meaning they are stored as images on the GPU and then displayed. The primary distinction between `GpuText` and `GpuLetterText` lies in how they handle textures. The `GpuText` class creates and stores a single texture for the entire text, while the `GpuLetterText` class stores textures for individual letters and renders them letter by letter on the display. Although `GpuLetterText` is more complex, it eliminates the need to update the texture image whenever the text-value needs to change.


## GpuText

Creating a new text

```ts
new GpuText(text: string, font?: Font, color?: Color);
```

Example:

```ts
const myText = new GpuText('Hallo world!', new Font(), Color.red);
```

and drawing the text to screen into the given `LayoutNode` *baseContainer* position:

```ts
myText.draw(context: Context, baseContainer, Alignment.centerCenter);
```

## Text alignment
When rendering text into a `LayoutNode`, the position within the area can be defined by setting the `Alignment` argument.

<example-gpu-text-alignment />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-gpu-text-alignment.vue)
</details>


## Text rotate
To set the rotation of a text use the `setRotation(deg: number)` function.

<example-gpu-text-rotation />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-gpu-text-rotation.vue)
</details>


## GpuLetterText

A letter-text is a text build from simple texture-letters.

```ts
new GpuLetterText(text: string, font?: Font, color?: Color);
```



## Letter Text rotate
To set the rotation of a text use the `setRotation(deg: number)` function.

<example-gpu-letter-text-rotation />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-gpu-letter-text-rotation.vue)
</details>