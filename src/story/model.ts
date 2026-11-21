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

export function sceneSpeech(scene: Scene, name: string) {
  const body = `${scene.title}. ${fillName(scene.text, name)}`;
  if (scene.ending) return `${body} ${fillName(scene.ending.note, name)}`;
  if (!scene.choices?.length) return body;
  const choices = scene.choices.map((choice, index) => `Choice ${index + 1}. ${choice.label}`).join(". ");
  return `${body} ${choices}`;
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
