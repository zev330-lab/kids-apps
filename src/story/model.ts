import type { PictureSpec, SpriteName } from "../art/types";

export type Choice = { label: string; to: string };

export type EndingInfo = {
  id: string;
  title: string;
  sticker: SpriteName;
  note: string;
};

export type Scene = {
  id: string;
  title: string;
  text: string;
  picture: PictureSpec;
  choices?: Choice[];
  ending?: EndingInfo;
};

export type World = {
  id: string;
  title: string;
  blurb: string;
  start: string;
  scenes: Record<string, Scene>;
};

export function fillName(text: string, name: string) {
  return text.replaceAll("{{name}}", name);
}

export function sceneSpeech(scene: Scene, name: string): string[] {
  const choices = scene.choices?.map((choice, index) => `Choice ${index + 1}. ${choice.label}`).join(". ");
  const script = [scene.title + ".", scene.text, scene.ending?.note, choices].filter(Boolean).join(" ");
  return script.split(/(\{\{name\}\}(?:'s)?)/).map((part) =>
    part.includes("{{name}}") ? fillName(part, name) : part.trim(),
  ).filter((part) => /[\p{L}\p{N}]/u.test(part));
}

export function lintWorld(world: World): string[] {
  const errors: string[] = [];
  const ids = Object.keys(world.scenes);
  if (ids.length < 10) errors.push(`${world.id} has ${ids.length} scenes`);
  if (!world.scenes[world.start]) errors.push(`${world.id} is missing its start`);
  let endings = 0;
  for (const scene of Object.values(world.scenes)) {
    if (scene.id !== scene.id.trim()) errors.push(`bad id ${scene.id}`);
    if (scene.ending) {
      endings += 1;
      if (scene.choices?.length) errors.push(`${world.id}/${scene.id} ending still has choices`);
    } else if (!scene.choices || scene.choices.length < 2) {
      errors.push(`${world.id}/${scene.id} needs two choices`);
    }
    for (const choice of scene.choices ?? []) {
      if (!world.scenes[choice.to]) errors.push(`${world.id}/${scene.id} -> ${choice.to}`);
    }
  }
  if (endings < 4) errors.push(`${world.id} has ${endings} endings`);
  const seen = new Set<string>();
  const queue = [world.start];
  while (queue.length) {
    const id = queue.pop() as string;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const choice of world.scenes[id]?.choices ?? []) queue.push(choice.to);
  }
  for (const id of ids) {
    if (!seen.has(id)) errors.push(`${world.id} cannot reach ${id}`);
  }
  return errors;
}
