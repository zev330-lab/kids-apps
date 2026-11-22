"""Render changed narration locally. No account, downloads or network calls."""
import fcntl
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro

voice, speed = "af_heart", 0.9
directory = Path(os.getenv("KOKORO_DIR", Path.home() / "dev/kokoro"))
output = Path("public/voice")
ffmpeg = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
model = None
manifest = {}
jobs = json.load(sys.stdin)
Path(".cache").mkdir(exist_ok=True)
# Serialize renderers so a second run cannot prune the first run's new clips.
lock = Path(".cache/voice-render.lock").open("a")
fcntl.flock(lock, fcntl.LOCK_EX)
for index, clip in enumerate(jobs):
    reading = clip["reading"]
    signature = json.dumps([reading, voice, speed, clip["shortStop"], "aac40-v1"])
    digest = hashlib.sha256(signature.encode()).hexdigest()[:20]
    filename = f'{clip["group"]}/{digest}.m4a'
    destination = output / filename
    manifest[clip["text"]] = "voice/" + filename
    if destination.is_file():
        continue
    if model is None:
        model = Kokoro(str(directory / "kokoro-v1.0.onnx"), str(directory / "voices-v1.0.bin"))
    exact = "{" in reading
    if exact:
        parts = re.split(r'(\{[^}]+\})', reading)
        reading = " ".join(p[1:-1] if p.startswith("{") else model.tokenizer.phonemize(p.strip(), "en-us")
                           for p in parts if p.strip())
    audio, sr = model.create(reading, voice=voice, speed=speed, lang="en-us", is_phonemes=exact)
    # Trim only the outer margins. Preserve the pauses between choices and sounds.
    active = np.flatnonzero(abs(audio) > max(0.001, np.max(abs(audio)) * 0.012))
    if not len(active):
        raise ValueError(f'Empty audio for {clip["text"]}')
    audio = audio[max(0, active[0] - sr // 100):active[-1] + sr // 35]
    if clip["shortStop"]:
        audio = audio[:int(sr * 0.17)].copy()
        fade = min(len(audio), sr // 150)
        audio[-fade:] *= np.linspace(1, 0, fade)
    destination.parent.mkdir(parents=True, exist_ok=True)
    tmp = destination.with_suffix(".tmp.m4a")
    # RMS normalize even very short phonemes, with peak headroom.
    gain = min(0.13 / np.sqrt(np.mean(audio ** 2)), 0.9 / np.max(abs(audio)))
    subprocess.run([ffmpeg, "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(sr),
                    "-ac", "1", "-i", "pipe:0", "-c:a", "aac", "-b:a", "40k",
                    "-movflags", "+faststart", str(tmp)], input=(audio * gain).astype("<f4").tobytes(), check=True)
    tmp.replace(destination)
    if index % 20 == 0:
        print(f"{index + 1}/{len(jobs)}", flush=True)

catalog_path = Path("src/lib/voice-manifest.json")
catalog_text = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
if not catalog_path.exists() or catalog_path.read_text() != catalog_text:
    staged = catalog_path.with_suffix(".tmp")
    staged.write_text(catalog_text)
    staged.replace(catalog_path)
# Remove obsolete generated clips only after the new catalog is complete.
retained = set(manifest.values())
for path in output.glob("*/*.m4a"):
    if re.fullmatch(r"[0-9a-f]{20}", path.stem) and str(path.relative_to("public")) not in retained:
        path.unlink()
print(f"{len(retained)} clips, {sum((Path('public') / p).stat().st_size for p in retained)} bytes")
