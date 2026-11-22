# Playtime

Three gentle apps for a phone, a tablet, or an iPad in Split View. The look is an original blocky game style: chunky characters, dark panels, and pressable buttons. Nothing leaves the device. There are no accounts, no ads, and no third-party requests.

- **Story Builder** is a choose-your-own-adventure with three worlds (Starlight Voyage, Whisperwood, and Coral Crown). The worlds have 79 scenes and 34 endings in all. Pictures are drawn in the app. A sticker book remembers endings in this browser, and the hero can be named. “Read to me” plays a local recording. The recording calls the named hero “our explorer.”
- **Scribble Friends** turns a finger drawing into a character with eyes, a mouth, arms, and legs. Kids can add backgrounds and stickers while drawing or dancing. Tap a sticker to select it, drag it, change its size, turn it, or peel it off. Undo also restores decoration changes. Save a PNG, share it with the device share sheet when that exists, or save a short movie (WebM/MP4 when the browser can record, otherwise a GIF). A gallery stays on the device.
- **Parker** is for Parker, age 6, to use beside a grown-up. Letter sounds, sight words, CVC words (cat, sun, map, and more), tiny books, counting to 20, adding within 10, and shapes. Nothing is timed. A miss says “let’s try again” and can offer a hint. A garden counts tries and practice, not points. Pip’s “Wiggly tummy” story says that trying matters more than being good at it, and that a wiggly tummy or a warm face can be what learning feels like.

Narration uses bundled mono AAC recordings by Kokoro’s af_heart voice at speed 0.9. Letter names and sounds have separate recordings. Sound effects are synthesized on the device. The Quiet/Sound button turns off effects and speech together.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints. Production check:

```bash
npm run build
npm run preview
```

`npm test` checks the story maps, the scribble measurements, Parker’s word and math rounds, and that the Parker screens do not use shame language.

`npm run test:e2e` builds the app and exercises the production preview in fresh headless phone and tablet contexts. Chromium and FFmpeg are required. WebKit projects are included when its executable is installed.

`npm run voice` extracts narration from the content and renders changed clips. It uses FFmpeg on PATH and the local Kokoro Python environment, ONNX model and voice bank under `~/dev/kokoro`. Override their locations with `KOKORO_PYTHON` and `KOKORO_DIR`. Ordinary builds use the existing files in `public/voice`.

## Add to the home screen

The build is a PWA. In Safari or Chrome, use Share or the browser menu and choose **Add to Home Screen**. The app and Parker recordings work offline after installation. Story recordings download in the background while online and work offline once cached. Playtime checks for updates on launch, when it becomes visible and hourly while open. Choose Later to keep playing, or finish the activity and tap the refresh prompt. The Home footer shows the installed build. Devices upgrading from the older automatic worker pick up the new Home screen on their next navigation or relaunch.

## Deploy for free

The build is a static `dist/` folder. Asset URLs are relative by default (`VITE_BASE=./`), so the same build works at a domain root or in a subfolder. Routes use hashes (`#/story`), so the host does not need rewrite rules.

### Vercel Hobby

This is the free option for a private repo. `vercel.json` already sets the Vite build and `dist` output. Import the repository, leave the framework settings as they are, and do not add a database or any paid add-on. No environment variables are required.

To force root-absolute asset URLs instead:

```bash
VITE_BASE=/ npm run build
```

### GitHub Pages

`.github/workflows/pages.yml` builds with `VITE_BASE=./` and deploys `dist` with the official Pages actions. In the repository settings, set Pages to **GitHub Actions**. That workflow is free on a public repository. GitHub does not include Pages for private repositories on the free plan, so keep this repo private on Vercel Hobby, or make it public before turning Pages on. Do not buy a plan for this.

For a project site that should use an absolute prefix instead of relative URLs, change the workflow env to `VITE_BASE=/your-repo-name/`.

## Screens

Phone layouts stack the picture, the words, and the buttons, with targets at least 48px. From about 800px wide, Scribble Friends docks colors on the left and backgrounds and stickers on the right, with brush tools under the canvas. Story Builder puts the picture beside the choices in landscape from 900px. Parker puts Pip and the grown-up note beside the activity in landscape, and uses a roomy activity grid on an iPad. Below about 420px (Slide Over), the header title sits on its own row so it does not collide with the buttons. Split View widths around 507px and 678px keep the stacked phone layout with slightly more room.

## What stays on the device

Hero name, found endings, Parker’s garden, the mute setting, and saved drawings (IndexedDB). No analytics and no remote APIs.
