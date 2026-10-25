# OpenHMI — From Idea to Working HMI

Production style: OpenHMI's white background, Arial typography, original four-dot identity, blue buttons, shared navigation and footer. Target route: `https://openhmi.network/demos/idea-to-prototype/`.

Open `index.html` directly in a modern browser. No build, server, installation, external font, CDN or API is needed. All illustration geometry, styles, content and interaction code are inside the file.

## Files

- `index.html`: responsive interactive page and inline static fallback.
- `architecture.svg`: editable vector illustration. Named groups identify physical parts; screen artwork is clipped to the display plane. Open it in a vector editor such as Figma, Illustrator or Inkscape.
- `README.md`: integration instructions and engineering assumptions.

The SVG is an independent export. Editing it does not automatically update the inline SVG inside `index.html`; preserve the inline element IDs and `data-*` attributes when transferring illustration edits to the interactive version.

## Controls

Choose one of six modes. The five stage buttons reveal inputs, outputs and responsibilities. Hardware component keys and numbered hotspots expose component details. Touch, rendering and connectivity modes offer Play/Pause, Next step and Replay. Use the zoom controls and Reset; when the drawing region has focus, Left/Right select stages, +/− zoom and Escape resets.

On narrow screens the overview bench scrolls horizontally. Selecting a stage or hardware mode fits that subject in the available width. Reduced-motion preferences disable automatic flows; Next step remains available. The short overview tour stops when the reader interacts. Flow timing illustrates causal order and is not a benchmark.

The final prototype's Start/Stop control changes a local GUI simulation. It sends no commands to real equipment. JavaScript-disabled browsers retain the complete inline illustration, a static-view notice, engineering notes and all five handoffs.

## Embed on openhmi.network

1. Upload `index.html` to `/demos/idea-to-prototype/index.html`. The SVG is optional for embedding; the page does not fetch it.
2. Add the following to the host page. The `embed=1` variant removes the standalone masthead, footer and repeated closing CTA. The title, main CTA and component remain visible.

```html
<iframe
  id="openhmi-workflow"
  src="/demos/idea-to-prototype/?embed=1"
  title="OpenHMI interactive idea-to-prototype engineering workflow"
  loading="lazy"
  style="display:block;width:100%;height:1500px;border:0;border-radius:10px"
></iframe>
<script>
  const workflowFrame = document.getElementById('openhmi-workflow');
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin ||
        event.source !== workflowFrame.contentWindow ||
        event.data?.type !== 'openhmi:resize') return;
    const height = Number(event.data.height);
    if (Number.isFinite(height) && height > 200 && height < 10000) {
      workflowFrame.style.height = `${Math.ceil(height)}px`;
    }
  });
</script>
```

The optional height message stays on the same origin. It sends only the component height, with no tracking or network request. If you omit the host script, set a suitable fixed iframe height and keep normal iframe scrolling enabled.

For a static embed, use:

```html
<img src="/demos/idea-to-prototype/architecture.svg"
     alt="Five stages from product idea and UI design through LVGL integration and ArtInChip hardware to a working HMI prototype"
     width="1320" height="650"
     style="display:block;max-width:100%;height:auto">
```

The CTA links to the existing OpenHMI intake at `https://openhmi.network/#intake`. Brand navigation returns to the homepage; all navigation URLs remain valid when the demo is in its nested directory.

### Content security policy

The page contains inline CSS and inline scripts. If your site enforces CSP, serve the standalone document with hashes for its exact inline blocks, or attach your server-generated nonce to each block. Do the same for the optional host resize listener. No `connect-src`, image, font or third-party script allowance is needed. Hashes change when you edit a block. Normal outbound navigation to OpenHMI and source documentation is user initiated.

To merge into a CMS instead of using an iframe, scope the stylesheet to a dedicated wrapper, prefix IDs, preserve the inline SVG definitions, and update script selectors. The iframe avoids stylesheet and ID collisions.

## Engineering model

This is a conceptual architecture, not a PCB schematic, production qualification, executable LVGL application or hardware benchmark.

- Reference part: **ArtInChip D211BBV**, with **integrated 64 MB DDR2**. No separate external DDR chip is shown or required for this selected package. The DDR annotation is not a die floorplan.
- External SPI NOR stores firmware/assets. Boot loading, memory mapping, partitioning and storage capacity depend on the BSP and board.
- The example TFT is **800 × 480 RGB565**. It illustrates a compatible RGB panel choice, not the SoC's maximum resolution or frame rate. One full buffer consumes **768,000 bytes / 750 KiB**; two consume **1,536,000 bytes / 1,500 KiB**. Add alignment/stride, images, fonts, stacks, application state and OS allocations to a real memory budget. Partial rendering can use smaller draw buffers, while the display port may still need scanout memory.
- The capacitive sensor uses an **external touch controller** with an illustrative I²C/interrupt connection. The panel, reset wiring, bus and pin assignment must be selected and validated.
- Wi-Fi/Bluetooth is an **optional external module**. SDIO/UART are example host choices subject to pin multiplexing, drivers and module selection. No integrated radio is implied.
- CAN needs an **external physical-layer transceiver**. RS485 uses **UART + external RS485 transceiver**. Protocols, termination, direction control, isolation, protection and certification remain project work.
- Board-level regulators, power sequencing, backlight driver, protection, thermal design and EMC need actual hardware engineering.
- Figma-style authoring screens are **design artifacts**. Mapping them to LVGL may use code-generation tools and manual implementation. Application callbacks, the state model, the board port and testing are explicit engineering responsibilities.
- Runtime diagrams show touch input, application events, rendering, buffers and scanout. They do not claim a GPU path or automatic LVGL hardware acceleration. Any acceleration needs a compatible BSP/driver.
- Glass and LCD separation is a service illustration, not scale or a depiction of permanently disconnected interconnects. Overlay paths are semantic relationships with implementation-dependent segments, not wires or asserted pin routing.
- All displayed process values are illustrative. The Start/Stop simulation never operates a machine.

## Sources

Checked 25 October 2026:

- [ArtInChip D21x product selection / D211BBV memory and peripheral table](https://www.artinchip.com/en/p/10.html)
- [ArtInChip D21x platform documentation](https://aicdoc.artinchip.com/topics/product/d21x-quick-start-chapter-soc-quickstart-d21x.html)
- [LVGL 9.2 display interface and draw-buffer modes](https://docs.lvgl.io/9.2/porting/display.html)
- [LVGL 9.2 input device port](https://docs.lvgl.io/9.2/porting/indev.html)
- [OpenHMI Network: current positioning and project intake](https://openhmi.network/)

Illustration geometry was authored with the installed [Anatomy](https://github.com/wheresryan22/anatomy) SVG kit (MIT). No Anatomy library or third-party runtime is required by the delivered page.
