# Drawing Texts

Texts are rendered using `GpuText` or `GpuLetterText`. `GpuText` renders the entire text as a single GPU texture, while `GpuLetterText` renders each letter individually for better performance when text changes frequently.


## GpuText

This class renders the entire text as a single GPU texture, making it efficient for static text.

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


## rotating
To set the rotation of a text use the `setRotation(deg: number)` function.

<example-gpu-text-rotation />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-gpu-text-rotation.vue)
</details>


## GpuLetterText

This class renders each letter as a separate GPU texture, allowing for efficient updates when the text content changes frequently.

```ts
new GpuLetterText(text: string, font?: Font, color?: Color);
```



## rotating
To set the rotation of a text use the `setRotation(deg: number)` function.

<example-gpu-letter-text-rotation />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-gpu-letter-text-rotation.vue)
</details>