import type { PictureItem, PictureSpec } from "../art/types";
import type { Scene, World } from "./model";

function pic(sky: PictureSpec["sky"], ground: PictureSpec["ground"], items: PictureItem[]): PictureSpec {
  return { sky, ground, items };
}

function scene(partial: Scene): Scene {
  return partial;
}

const starlightScenes: Scene[] = [
  scene({
    id: "pad",
    title: "The Soft Launch",
    text: "{{name}} stood in a field of warm lights. A round rocket hummed a happy note. The sky looked like blueberry yogurt with gold sprinkles.",
    picture: pic("space", "moon", [
      { s: "rocket", x: 210, y: 168, scale: 1.15, anim: "bob" },
      { s: "moon", x: 320, y: 78, scale: 0.7 },
      { s: "star", x: 70, y: 60, scale: 0.45, anim: "twinkle" },
    ]),
    choices: [
      { label: "Climb into the rocket", to: "cockpit" },
      { label: "Visit the moonflower garden", to: "garden" },
    ],
  }),
  scene({
    id: "cockpit",
    title: "Inside the Rocket",
    text: "The seat was squishy. Buttons glowed like candies. A friendly screen blinked, Where to, {{name}}?",
    picture: pic("space", "none", [
      { s: "rocket", x: 200, y: 170, scale: 1.35 },
      { s: "star", x: 70, y: 70, scale: 0.4, anim: "twinkle" },
      { s: "star", x: 330, y: 90, scale: 0.35, anim: "twinkle" },
      { s: "comet", x: 300, y: 180, scale: 0.7, anim: "drift" },
    ]),
    choices: [
      { label: "Zoom to the rainbow nebula", to: "nebula" },
      { label: "Land on the sleepy moon", to: "moon" },
    ],
  }),
  scene({
    id: "garden",
    title: "Moonflower Garden",
    text: "Silver flowers opened with little yawns. A moon rabbit in a scarf held a tiny suitcase. Room for one more?",
    picture: pic("space", "moon", [
      { s: "flower", x: 90, y: 190, scale: 0.9, anim: "sway" },
      { s: "flower", x: 300, y: 200, scale: 0.8, anim: "sway" },
      { s: "rabbit", x: 200, y: 180, scale: 1.05, anim: "bob" },
      { s: "star", x: 40, y: 50, scale: 0.4, anim: "twinkle" },
    ]),
    choices: [
      { label: "Invite Moon Rabbit aboard", to: "rabbit" },
      { label: "Wave and launch", to: "cockpit" },
    ],
  }),
  scene({
    id: "rabbit",
    title: "Copilot Rabbit",
    text: "Moon Rabbit buckled a dandelion seatbelt. Their ears floated like balloons. I know two lovely places, they told {{name}}.",
    picture: pic("space", "moon", [
      { s: "rabbit", x: 150, y: 180, scale: 1.1, anim: "bob" },
      { s: "rocket", x: 280, y: 170, scale: 0.9 },
      { s: "star", x: 50, y: 60, scale: 0.4, anim: "twinkle" },
    ]),
    choices: [
      { label: "Follow Rabbit's comet", to: "comet" },
      { label: "Go to the moon picnic", to: "mice" },
    ],
  }),
  scene({
    id: "nebula",
    title: "Rainbow Nebula",
    text: "Color drifted by like scarves in water. A comet sang la la la. A cloud of stardust winked at {{name}}.",
    picture: pic("candy", "none", [
      { s: "comet", x: 250, y: 150, scale: 1.2, anim: "drift" },
      { s: "cloud", x: 120, y: 120, scale: 1 },
      { s: "star", x: 60, y: 60, scale: 0.5, anim: "twinkle" },
      { s: "star", x: 340, y: 80, scale: 0.4, anim: "twinkle" },
    ]),
    choices: [
      { label: "Follow the singing comet", to: "comet" },
      { label: "Rest in the stardust cloud", to: "stardust" },
    ],
  }),
  scene({
    id: "moon",
    title: "The Sleepy Moon",
    text: "The moon was warm, like a night-light you could walk on. Craters made perfect picnic bowls. Mice in sweaters waved to {{name}}.",
    picture: pic("dusk", "moon", [
      { s: "moon", x: 80, y: 70, scale: 0.8 },
      { s: "mouse", x: 180, y: 190, scale: 0.9, anim: "bob" },
      { s: "mouse", x: 280, y: 200, scale: 0.75 },
      { s: "cookie", x: 230, y: 210, scale: 0.6 },
    ]),
    choices: [
      { label: "Share star cookies", to: "mice" },
      { label: "Slide down a silver dune", to: "dune" },
    ],
  }),
  scene({
    id: "comet",
    title: "The Singing Comet",
    text: "The comet had forgotten the way home. Its song wobbled. It still tried, which was brave. {{name}} listened.",
    picture: pic("space", "none", [
      { s: "comet", x: 200, y: 160, scale: 1.45, anim: "drift" },
      { s: "star", x: 70, y: 70, scale: 0.45, anim: "twinkle" },
      { s: "star", x: 330, y: 200, scale: 0.4, anim: "twinkle" },
    ]),
    choices: [
      { label: "Sing a lullaby to guide it", to: "end-lullaby" },
      { label: "Race kindly to the candy planet", to: "candy" },
    ],
  }),
  scene({
    id: "stardust",
    title: "Stardust Cloud",
    text: "Everything sparkled, even {{name}}'s nose. A little satellite blinked. My light is shy, it said.",
    picture: pic("space", "none", [
      { s: "cloud", x: 140, y: 150, scale: 1.3 },
      { s: "satellite", x: 250, y: 160, scale: 1.1, anim: "bob" },
      { s: "star", x: 60, y: 60, scale: 0.5, anim: "twinkle" },
      { s: "star", x: 340, y: 90, scale: 0.35, anim: "twinkle" },
    ]),
    choices: [
      { label: "Help the shy light", to: "repair" },
      { label: "Follow its blinking map", to: "kites" },
    ],
  }),
  scene({
    id: "repair",
    title: "A Gentle Fix",
    text: "{{name}} turned a flower-shaped bolt. The satellite giggled. Oh! I remember how to shine.",
    picture: pic("space", "none", [
      { s: "satellite", x: 200, y: 150, scale: 1.4, anim: "bob" },
      { s: "flower", x: 300, y: 200, scale: 0.7 },
      { s: "star", x: 80, y: 80, scale: 0.45, anim: "twinkle" },
    ]),
    choices: [
      { label: "Switch the light on together", to: "end-mechanic" },
      { label: "Let it lead you to the kites", to: "kites" },
    ],
  }),
  scene({
    id: "mice",
    title: "Moon Mice Picnic",
    text: "The mice poured warm moon-milk. Cookies were shaped like stars, and one was shaped like {{name}}'s smile.",
    picture: pic("dusk", "moon", [
      { s: "mouse", x: 140, y: 190, scale: 1, anim: "bob" },
      { s: "mouse", x: 250, y: 185, scale: 0.85 },
      { s: "cookie", x: 200, y: 210, scale: 0.7 },
      { s: "cookie", x: 300, y: 200, scale: 0.55 },
      { s: "moon", x: 70, y: 70, scale: 0.65 },
    ]),
    choices: [
      { label: "Stay for the moon dance", to: "end-dance" },
      { label: "Take their kite map", to: "kites" },
    ],
  }),
  scene({
    id: "dune",
    title: "Silver Dune",
    text: "{{name}} slid, slow as honey. At the bottom, a cave chimed. Glitter footprints went another way.",
    picture: pic("dusk", "snow", [
      { s: "hill", x: 120, y: 200, scale: 1.2 },
      { s: "hill", x: 260, y: 210, scale: 1.4 },
      { s: "crystal", x: 320, y: 160, scale: 0.7, anim: "twinkle" },
      { s: "star", x: 60, y: 50, scale: 0.4, anim: "twinkle" },
    ]),
    choices: [
      { label: "Enter the crystal cave", to: "choir" },
      { label: "Follow the glitter footprints", to: "kites" },
    ],
  }),
  scene({
    id: "candy",
    title: "Candy Planet",
    text: "Lollipop trees clinked in the breeze. The comet arrived, puffing, and laughed. A jelly crown sat on a pillow.",
    picture: pic("candy", "grass", [
      { s: "candy", x: 100, y: 150, scale: 1, anim: "sway" },
      { s: "candy", x: 300, y: 140, scale: 0.85, anim: "sway" },
      { s: "comet", x: 200, y: 180, scale: 0.9, anim: "bob" },
      { s: "flower", x: 40, y: 200, scale: 0.6 },
    ]),
    choices: [
      { label: "Share the jelly crown", to: "end-sweet" },
      { label: "Follow the candy birds", to: "kites" },
    ],
  }),
  scene({
    id: "choir",
    title: "Crystal Choir",
    text: "Crystals hummed in colors. They wanted a voice to join. Not a perfect voice. Just a kind one. {{name}} took a breath.",
    picture: pic("cave", "none", [
      { s: "crystal", x: 120, y: 170, scale: 1.1, anim: "twinkle" },
      { s: "crystal", x: 200, y: 150, scale: 1.35, anim: "bob" },
      { s: "crystal", x: 290, y: 180, scale: 0.9, anim: "twinkle" },
    ]),
    choices: [
      { label: "Sing with the crystals", to: "end-singer" },
      { label: "Borrow a gentle compass", to: "kites" },
    ],
  }),
  scene({
    id: "kites",
    title: "Planet of Kites",
    text: "The sky was full of kites shaped like fish, foxes, and spoons. One kite nudged {{name}}'s hand. Your turn.",
    picture: pic("day", "grass", [
      { s: "kite", x: 120, y: 90, scale: 0.9, anim: "drift" },
      { s: "kite", x: 250, y: 70, scale: 1.1, anim: "sway" },
      { s: "kite", x: 320, y: 140, scale: 0.7, anim: "drift" },
      { s: "hill", x: 200, y: 230, scale: 1.5 },
      { s: "cloud", x: 60, y: 50, scale: 0.7 },
    ]),
    choices: [
      { label: "Let a kite lift you to sunrise", to: "end-sunrise" },
      { label: "Plant the kite as a friendship flag", to: "end-flag" },
    ],
  }),
  scene({
    id: "end-lullaby",
    title: "Lullaby Pilot",
    text: "{{name}} sang until the comet remembered the way. The song did not have to be perfect. It only had to be kind.",
    picture: pic("space", "none", [
      { s: "comet", x: 180, y: 160, scale: 1.3, anim: "drift" },
      { s: "heart", x: 300, y: 120, scale: 0.8, anim: "bob" },
      { s: "star", x: 70, y: 70, scale: 0.5, anim: "twinkle" },
    ]),
    ending: {
      id: "lullaby",
      title: "Lullaby Pilot",
      sticker: "comet",
      note: "A wobbly song can still lead someone home.",
    },
  }),
  scene({
    id: "end-mechanic",
    title: "Kind Mechanic",
    text: "The little light shone again. {{name}} and the satellite had fixed it together, one gentle turn at a time.",
    picture: pic("space", "none", [
      { s: "satellite", x: 200, y: 150, scale: 1.4, anim: "bob" },
      { s: "star", x: 300, y: 80, scale: 0.6, anim: "twinkle" },
      { s: "heart", x: 90, y: 180, scale: 0.7 },
    ]),
    ending: {
      id: "mechanic",
      title: "Kind Mechanic",
      sticker: "satellite",
      note: "Helping a shy light shine is a fine kind of brave.",
    },
  }),
  scene({
    id: "end-dance",
    title: "Moon Dance",
    text: "Moon mice twirled in their sweaters. {{name}} danced the slow spin and the giggly spin. Everybody clapped with crumbs on their paws.",
    picture: pic("dusk", "moon", [
      { s: "mouse", x: 150, y: 190, scale: 1.05, anim: "bob" },
      { s: "mouse", x: 250, y: 180, scale: 0.9, anim: "sway" },
      { s: "cookie", x: 200, y: 120, scale: 0.7, anim: "drift" },
      { s: "moon", x: 70, y: 70, scale: 0.7 },
    ]),
    ending: {
      id: "dance",
      title: "Moon Dance",
      sticker: "mouse",
      note: "Staying for the dance made the moon feel like a friend.",
    },
  }),
  scene({
    id: "end-sweet",
    title: "Sweet Share",
    text: "{{name}} shared the jelly crown. The comet wore it, then a mouse, then a flower. It fit every friend.",
    picture: pic("candy", "grass", [
      { s: "candy", x: 200, y: 150, scale: 1.2, anim: "bob" },
      { s: "comet", x: 300, y: 180, scale: 0.8 },
      { s: "flower", x: 90, y: 190, scale: 0.8 },
      { s: "heart", x: 320, y: 70, scale: 0.6, anim: "twinkle" },
    ]),
    ending: {
      id: "sweet",
      title: "Sweet Share",
      sticker: "candy",
      note: "A treat is sweeter when it goes around.",
    },
  }),
  scene({
    id: "end-singer",
    title: "Crystal Singer",
    text: "The crystals hummed along. They liked {{name}}'s voice just as it was, wobbles and all.",
    picture: pic("cave", "none", [
      { s: "crystal", x: 200, y: 160, scale: 1.4, anim: "twinkle" },
      { s: "star", x: 80, y: 80, scale: 0.5, anim: "twinkle" },
      { s: "heart", x: 320, y: 180, scale: 0.7, anim: "bob" },
    ]),
    ending: {
      id: "singer",
      title: "Crystal Singer",
      sticker: "crystal",
      note: "Joining in matters more than sounding perfect.",
    },
  }),
  scene({
    id: "end-sunrise",
    title: "Sunrise Ride",
    text: "The kite lifted {{name}} up to a peach-colored sunrise. The wind held on gently and did not let go.",
    picture: pic("sunset", "grass", [
      { s: "kite", x: 200, y: 110, scale: 1.3, anim: "drift" },
      { s: "sun", x: 320, y: 80, scale: 0.7 },
      { s: "hill", x: 120, y: 230, scale: 1.4 },
      { s: "cloud", x: 70, y: 60, scale: 0.7 },
    ]),
    ending: {
      id: "sunrise",
      title: "Sunrise Ride",
      sticker: "kite",
      note: "A brave ride can still be a gentle one.",
    },
  }),
  scene({
    id: "end-flag",
    title: "Friendship Flag",
    text: "{{name}} planted the kite like a flag. It meant friends can find this place, and they will save you a cookie.",
    picture: pic("day", "grass", [
      { s: "flag", x: 200, y: 150, scale: 1.3, anim: "sway" },
      { s: "kite", x: 300, y: 80, scale: 0.7, anim: "drift" },
      { s: "flower", x: 90, y: 200, scale: 0.8 },
      { s: "heart", x: 320, y: 180, scale: 0.6 },
    ]),
    ending: {
      id: "flag",
      title: "Friendship Flag",
      sticker: "flag",
      note: "Leaving a sign of friendship is a kind of map.",
    },
  }),
];

const forestScenes: Scene[] = [
  scene({
    id: "gate",
    title: "The Mossy Gate",
    text: "Whisperwood smelled like rain and oranges. The gate was soft with moss. Two paths waited for {{name}}, and both looked friendly.",
    picture: pic("meadow", "grass", [
      { s: "tree", x: 80, y: 160, scale: 1.1 },
      { s: "tree", x: 320, y: 150, scale: 1.2 },
      { s: "lantern", x: 200, y: 170, scale: 1, anim: "bob" },
      { s: "flower", x: 150, y: 210, scale: 0.6 },
    ]),
    choices: [
      { label: "Take the lantern path", to: "lantern" },
      { label: "Skip the mushroom path", to: "mushrooms" },
    ],
  }),
  scene({
    id: "lantern",
    title: "Lantern Path",
    text: "Fireflies had lost a little of their glow. They drifted like sleepy sparks. {{name}}'s lantern was warm enough to share.",
    picture: pic("dusk", "grass", [
      { s: "lantern", x: 180, y: 160, scale: 1.2, anim: "bob" },
      { s: "firefly", x: 280, y: 120, scale: 0.8, anim: "drift" },
      { s: "firefly", x: 100, y: 100, scale: 0.7, anim: "twinkle" },
      { s: "tree", x: 340, y: 170, scale: 0.9 },
    ]),
    choices: [
      { label: "Share the lantern light", to: "glow" },
      { label: "Follow one brave firefly", to: "hollow" },
    ],
  }),
  scene({
    id: "mushrooms",
    title: "Mushroom Path",
    text: "A fox in a teacup hat peeked out. The mushrooms were as tall as {{name}}'s knees and spotted like stories.",
    picture: pic("meadow", "grass", [
      { s: "mushroom", x: 100, y: 180, scale: 1.1 },
      { s: "mushroom", x: 300, y: 190, scale: 0.9 },
      { s: "fox", x: 200, y: 175, scale: 1, anim: "bob" },
      { s: "flower", x: 40, y: 200, scale: 0.6 },
    ]),
    choices: [
      { label: "Sit for acorn tea", to: "tea" },
      { label: "Help find a lost teacup", to: "brook" },
    ],
  }),
  scene({
    id: "glow",
    title: "Shared Glow",
    text: "The fireflies borrowed {{name}}'s light and gave some back. The path turned gold, then pink, then a color with no name yet.",
    picture: pic("dusk", "grass", [
      { s: "firefly", x: 120, y: 140, scale: 1, anim: "drift" },
      { s: "firefly", x: 200, y: 100, scale: 0.9, anim: "twinkle" },
      { s: "firefly", x: 280, y: 160, scale: 0.85, anim: "bob" },
      { s: "flower", x: 200, y: 210, scale: 0.8 },
    ]),
    choices: [
      { label: "Dance under the lights", to: "end-firefly" },
      { label: "Ask the way to the library", to: "library" },
    ],
  }),
  scene({
    id: "hollow",
    title: "Owl Hollow",
    text: "Baby Owl could not sleep. The dark was not scary. It was just big. {{name}} sat on a soft root.",
    picture: pic("dusk", "grass", [
      { s: "tree", x: 200, y: 150, scale: 1.5 },
      { s: "owl", x: 200, y: 150, scale: 0.85, anim: "bob" },
      { s: "lantern", x: 80, y: 190, scale: 0.7 },
    ]),
    choices: [
      { label: "Tell a soft story", to: "end-owl" },
      { label: "Hum a walking song onward", to: "library" },
    ],
  }),
  scene({
    id: "tea",
    title: "Acorn Tea",
    text: "Fox poured tea that tasted like warm apples. A seed rolled across the table and stopped at {{name}}'s hand.",
    picture: pic("meadow", "grass", [
      { s: "fox", x: 160, y: 180, scale: 1.05, anim: "bob" },
      { s: "cup", x: 250, y: 190, scale: 1 },
      { s: "mushroom", x: 320, y: 185, scale: 0.8 },
      { s: "sprout", x: 70, y: 200, scale: 0.8 },
    ]),
    choices: [
      { label: "Plant the friendship seed", to: "end-tree" },
      { label: "Carry the seed to the brook", to: "stones" },
    ],
  }),
  scene({
    id: "brook",
    title: "Singing Brook",
    text: "The water sang in a small voice. Fox's teacup sat under a lily pad, taking a rest. {{name}} knelt in the moss.",
    picture: pic("day", "water", [
      { s: "lily", x: 160, y: 200, scale: 1.1 },
      { s: "cup", x: 230, y: 180, scale: 0.9, anim: "bob" },
      { s: "fish", x: 300, y: 210, scale: 0.8, anim: "drift" },
      { s: "flower", x: 60, y: 170, scale: 0.6 },
    ]),
    choices: [
      { label: "Lift the teacup gently", to: "cup" },
      { label: "Sit and listen to the stones", to: "stones" },
    ],
  }),
  scene({
    id: "cup",
    title: "Teacup Found",
    text: "The cup was not broken. It was just lost, which can feel the same until someone looks. {{name}} held it with two hands.",
    picture: pic("meadow", "grass", [
      { s: "fox", x: 240, y: 180, scale: 1, anim: "bob" },
      { s: "cup", x: 150, y: 185, scale: 1.2 },
      { s: "flower", x: 70, y: 200, scale: 0.7 },
      { s: "heart", x: 320, y: 90, scale: 0.6, anim: "twinkle" },
    ]),
    choices: [
      { label: "Celebrate by planting a seed", to: "end-tree" },
      { label: "Follow the brook song", to: "stones" },
    ],
  }),
  scene({
    id: "library",
    title: "Owl Library",
    text: "Books dozed on low shelves, perfect for {{name}}. One book giggled in its sleep. Another had a map for a bookmark.",
    picture: pic("dusk", "grass", [
      { s: "book", x: 150, y: 180, scale: 1.3 },
      { s: "book", x: 230, y: 190, scale: 1 },
      { s: "owl", x: 310, y: 160, scale: 0.9, anim: "bob" },
      { s: "lantern", x: 70, y: 170, scale: 0.8 },
    ]),
    choices: [
      { label: "Read the giggling book", to: "end-giggle" },
      { label: "Open the map book", to: "meadow" },
    ],
  }),
  scene({
    id: "stones",
    title: "Pebble Song",
    text: "Smooth stones tapped a beat in the brook. They did not mind a quiet singer. {{name}} could hum or follow the pebble arrows.",
    picture: pic("day", "water", [
      { s: "fish", x: 120, y: 200, scale: 0.8, anim: "drift" },
      { s: "sprout", x: 250, y: 170, scale: 1 },
      { s: "lily", x: 190, y: 210, scale: 0.9 },
      { s: "flower", x: 320, y: 160, scale: 0.7, anim: "sway" },
    ]),
    choices: [
      { label: "Sing with the brook", to: "end-bard" },
      { label: "Follow the pebble arrows", to: "meadow" },
    ],
  }),
  scene({
    id: "meadow",
    title: "Shy Meadow",
    text: "A unicorn stood in the tall grass, pretending to be a cloud. An apple shone nearby. Flowers asked to be a crown. {{name}} moved slowly.",
    picture: pic("day", "grass", [
      { s: "unicorn", x: 220, y: 170, scale: 1.15, anim: "bob" },
      { s: "flower", x: 80, y: 200, scale: 0.8, anim: "sway" },
      { s: "flower", x: 330, y: 190, scale: 0.7, anim: "sway" },
      { s: "apple", x: 130, y: 200, scale: 0.7 },
    ]),
    choices: [
      { label: "Offer the shiny apple", to: "end-picnic" },
      { label: "Weave a flower crown", to: "end-crown" },
    ],
  }),
  scene({
    id: "end-firefly",
    title: "Firefly Dance",
    text: "The fireflies made a lantern out of the night. {{name}} danced inside the glow, and nobody had to be the best dancer.",
    picture: pic("dusk", "grass", [
      { s: "firefly", x: 200, y: 140, scale: 1.4, anim: "bob" },
      { s: "star", x: 80, y: 70, scale: 0.45, anim: "twinkle" },
      { s: "heart", x: 310, y: 170, scale: 0.7 },
      { s: "flower", x: 100, y: 210, scale: 0.7 },
    ]),
    ending: { id: "firefly", title: "Firefly Dance", sticker: "firefly", note: "Sharing light makes more light." },
  }),
  scene({
    id: "end-owl",
    title: "Story Owl",
    text: "Baby Owl's eyes grew sleepy. The story {{name}} told was soft enough to wear like a blanket.",
    picture: pic("dusk", "grass", [
      { s: "owl", x: 200, y: 160, scale: 1.3, anim: "bob" },
      { s: "book", x: 90, y: 190, scale: 0.9 },
      { s: "moon", x: 320, y: 70, scale: 0.6 },
    ]),
    ending: { id: "owl", title: "Story Owl", sticker: "owl", note: "A soft story is a kind way to say good night." },
  }),
  scene({
    id: "end-tree",
    title: "Friendship Tree",
    text: "A tiny tree curled up from the seed. Fox and {{name}} promised to visit when it was taller. The promise was the water.",
    picture: pic("meadow", "grass", [
      { s: "sprout", x: 200, y: 180, scale: 1.6, anim: "sway" },
      { s: "fox", x: 300, y: 180, scale: 0.85 },
      { s: "heart", x: 90, y: 150, scale: 0.7, anim: "bob" },
    ]),
    ending: { id: "tree", title: "Friendship Tree", sticker: "sprout", note: "Growing takes tries. Trees know that." },
  }),
  scene({
    id: "end-giggle",
    title: "Giggle Librarian",
    text: "The picture book laughed on every page. {{name}} read it out loud, even the silly words, and the shelves seemed to lean in.",
    picture: pic("dusk", "grass", [
      { s: "book", x: 200, y: 170, scale: 1.6 },
      { s: "owl", x: 310, y: 160, scale: 0.8, anim: "bob" },
      { s: "star", x: 80, y: 80, scale: 0.45, anim: "twinkle" },
    ]),
    ending: { id: "giggle", title: "Giggle Librarian", sticker: "book", note: "Reading out loud is brave, even when you giggle." },
  }),
  scene({
    id: "end-bard",
    title: "Brook Bard",
    text: "The brook liked {{name}}'s song. The stones tapped the beat. A fish clapped with its tail, which is tricky.",
    picture: pic("day", "water", [
      { s: "lily", x: 160, y: 190, scale: 1.1 },
      { s: "fish", x: 260, y: 180, scale: 1.1, anim: "drift" },
      { s: "heart", x: 70, y: 140, scale: 0.7 },
    ]),
    ending: { id: "bard", title: "Brook Bard", sticker: "lily", note: "A small song is still a real song." },
  }),
  scene({
    id: "end-picnic",
    title: "Unicorn Picnic",
    text: "The unicorn shared the apple, bite for bite. {{name}} and the unicorn ate in the tall grass and talked about clouds.",
    picture: pic("day", "grass", [
      { s: "unicorn", x: 210, y: 165, scale: 1.2, anim: "bob" },
      { s: "apple", x: 100, y: 190, scale: 0.9 },
      { s: "flower", x: 320, y: 190, scale: 0.8 },
    ]),
    ending: { id: "picnic", title: "Unicorn Picnic", sticker: "unicorn", note: "Sharing a snack can make a shy friend braver." },
  }),
  scene({
    id: "end-crown",
    title: "Flower Crown",
    text: "{{name}} wove a flower crown. The unicorn wore it like a quiet thank-you. A petal tickled, and that was allowed.",
    picture: pic("day", "grass", [
      { s: "unicorn", x: 200, y: 165, scale: 1.2 },
      { s: "flower", x: 90, y: 170, scale: 0.9, anim: "sway" },
      { s: "flower", x: 310, y: 180, scale: 0.9, anim: "sway" },
      { s: "heart", x: 200, y: 70, scale: 0.7, anim: "bob" },
    ]),
    ending: { id: "crown", title: "Flower Crown", sticker: "flower", note: "Making something for a friend is its own kind of magic." },
  }),
];

const coralScenes: Scene[] = [
  scene({
    id: "shore",
    title: "Bubble Shore",
    text: "The sea tapped {{name}}'s toes like a polite hello. A bubble submarine bobbed. Dot the dolphin drew a smile in the waves.",
    picture: pic("sunset", "sand", [
      { s: "sun", x: 320, y: 70, scale: 0.7 },
      { s: "shell", x: 80, y: 200, scale: 0.9 },
      { s: "dolphin", x: 220, y: 180, scale: 1.1, anim: "bob" },
      { s: "balloon", x: 140, y: 90, scale: 0.7, anim: "drift" },
    ]),
    choices: [
      { label: "Board the bubble submarine", to: "sub" },
      { label: "Ride with Dot the dolphin", to: "dolphin" },
    ],
  }),
  scene({
    id: "sub",
    title: "Bubble Submarine",
    text: "Inside, the windows were round as cookies. Fish waved with their fins. {{name}} steered with one careful finger.",
    picture: pic("sea", "water", [
      { s: "sub", x: 200, y: 160, scale: 1.3, anim: "bob" },
      { s: "fish", x: 80, y: 120, scale: 0.8, anim: "drift" },
      { s: "fish", x: 320, y: 190, scale: 0.7, anim: "drift" },
      { s: "balloon", x: 300, y: 80, scale: 0.5 },
    ]),
    choices: [
      { label: "Visit seahorse school", to: "school" },
      { label: "Search the coral reef", to: "reef" },
    ],
  }),
  scene({
    id: "dolphin",
    title: "Dot's Ride",
    text: "Dot swam smoothly so {{name}} could hold on. I know a song, said Dot, and I know a friend with a painted shell.",
    picture: pic("sea", "water", [
      { s: "dolphin", x: 200, y: 160, scale: 1.45, anim: "bob" },
      { s: "fish", x: 80, y: 140, scale: 0.7, anim: "drift" },
      { s: "balloon", x: 320, y: 90, scale: 0.55, anim: "drift" },
    ]),
    choices: [
      { label: "Learn Dot's tide song", to: "whale" },
      { label: "Play-race to the reef", to: "turtle" },
    ],
  }),
  scene({
    id: "school",
    title: "Seahorse School",
    text: "Little seahorses practiced letters made of shells. The letter of the day was a curvy one. {{name}} was welcome to help or to parade.",
    picture: pic("sea", "water", [
      { s: "seahorse", x: 150, y: 160, scale: 1.1, anim: "sway" },
      { s: "seahorse", x: 250, y: 175, scale: 0.85, anim: "bob" },
      { s: "shell", x: 200, y: 210, scale: 0.7 },
      { s: "fish", x: 60, y: 120, scale: 0.6 },
    ]),
    choices: [
      { label: "Help with shell letters", to: "end-teacher" },
      { label: "Join the parade to the palace", to: "parade" },
    ],
  }),
  scene({
    id: "reef",
    title: "Coral Reef",
    text: "The reef was a garden that waved. An octopus had a ribbon of seaweed stuck on one arm and looked a little shy about it.",
    picture: pic("sea", "water", [
      { s: "octopus", x: 200, y: 170, scale: 1.15, anim: "bob" },
      { s: "flower", x: 90, y: 180, scale: 0.8, anim: "sway" },
      { s: "flower", x: 320, y: 190, scale: 0.7, anim: "sway" },
      { s: "fish", x: 40, y: 120, scale: 0.7, anim: "drift" },
    ]),
    choices: [
      { label: "Untangle the octopus gently", to: "pearl" },
      { label: "Follow a trail of bubbles", to: "turtle" },
    ],
  }),
  scene({
    id: "whale",
    title: "Tide Whale",
    text: "A whale as big as a bedtime story floated beside {{name}}. I forgot the middle of the tide song, the whale whispered. That happens.",
    picture: pic("sea", "water", [
      { s: "whale", x: 200, y: 160, scale: 1.35, anim: "bob" },
      { s: "fish", x: 70, y: 140, scale: 0.7, anim: "drift" },
      { s: "balloon", x: 330, y: 80, scale: 0.5 },
    ]),
    choices: [
      { label: "Sing the tide lullaby", to: "end-tidesong" },
      { label: "Ask for a ride to the palace", to: "parade" },
    ],
  }),
  scene({
    id: "turtle",
    title: "Garden Turtle",
    text: "A turtle paddled by with a plain shell and a hopeful look. Flowers wanted somewhere to sit. The palace path glowed nearby.",
    picture: pic("sea", "water", [
      { s: "turtle", x: 200, y: 170, scale: 1.3, anim: "bob" },
      { s: "flower", x: 90, y: 160, scale: 0.75, anim: "sway" },
      { s: "shell", x: 320, y: 190, scale: 0.7 },
    ]),
    choices: [
      { label: "Paint flowers on the shell", to: "end-shellgarden" },
      { label: "Walk together to the palace", to: "parade" },
    ],
  }),
  scene({
    id: "pearl",
    title: "A Loose Ribbon",
    text: "The octopus was free and giggled in bubbles. A pearl had been stuck in the ribbon. You found it, they told {{name}}. You choose where it goes.",
    picture: pic("sea", "water", [
      { s: "octopus", x: 170, y: 170, scale: 1.15, anim: "bob" },
      { s: "pearl", x: 280, y: 160, scale: 1.1, anim: "twinkle" },
      { s: "fish", x: 60, y: 130, scale: 0.7, anim: "drift" },
    ]),
    choices: [
      { label: "Carry the pearl to the queen", to: "throne" },
      { label: "Visit the baker crabs", to: "bakery" },
    ],
  }),
  scene({
    id: "parade",
    title: "Palace Parade",
    text: "Seahorses, fish, and {{name}} swished up to a pink palace. The queen liked letters. The baker crabs liked helpers. Both doors were open.",
    picture: pic("sea", "water", [
      { s: "palace", x: 250, y: 160, scale: 1.2 },
      { s: "seahorse", x: 90, y: 180, scale: 0.9, anim: "sway" },
      { s: "fish", x: 160, y: 200, scale: 0.75, anim: "drift" },
      { s: "balloon", x: 330, y: 80, scale: 0.55 },
    ]),
    choices: [
      { label: "Give the queen a shell letter", to: "end-penpal" },
      { label: "Help the baker crabs", to: "bakery" },
    ],
  }),
  scene({
    id: "throne",
    title: "The Pink Palace",
    text: "The queen's crown was a little big, even for a queen. The smallest fish nearby looked at it with wide, polite eyes. {{name}} had the pearl.",
    picture: pic("sea", "water", [
      { s: "palace", x: 200, y: 155, scale: 1.35 },
      { s: "pearl", x: 200, y: 150, scale: 0.7, anim: "twinkle" },
      { s: "fish", x: 80, y: 190, scale: 0.8, anim: "bob" },
      { s: "fish", x: 320, y: 180, scale: 0.55, anim: "drift" },
    ]),
    choices: [
      { label: "Ask to crown the smallest fish", to: "end-kindcrown" },
      { label: "Invite everyone to a pearl picnic", to: "end-pearlpincic" },
    ],
  }),
  scene({
    id: "bakery",
    title: "Crab Bakery",
    text: "Baker crabs slid a cake across a shell table. It needed star-sugar or it needed sharing. {{name}} could do either. Both were kind.",
    picture: pic("candy", "sand", [
      { s: "crab", x: 140, y: 180, scale: 1.05, anim: "bob" },
      { s: "cake", x: 250, y: 175, scale: 1.15 },
      { s: "shell", x: 320, y: 200, scale: 0.7 },
      { s: "star", x: 80, y: 70, scale: 0.45, anim: "twinkle" },
    ]),
    choices: [
      { label: "Sprinkle the star-sugar", to: "end-baker" },
      { label: "Share slices with the reef", to: "end-reefshare" },
    ],
  }),
  scene({
    id: "end-teacher",
    title: "Shell Teacher",
    text: "The seahorses made the letter of the day out of shells. {{name}} helped, shell by shell, and nobody rushed.",
    picture: pic("sea", "water", [
      { s: "seahorse", x: 180, y: 160, scale: 1.2, anim: "sway" },
      { s: "shell", x: 280, y: 180, scale: 1 },
      { s: "heart", x: 80, y: 140, scale: 0.65 },
    ]),
    ending: { id: "teacher", title: "Shell Teacher", sticker: "seahorse", note: "Helping someone practice is practice too." },
  }),
  scene({
    id: "end-tidesong",
    title: "Tide Singer",
    text: "The whale remembered the tide song because {{name}} sang the wobbly parts too. The sea went hush, then happy.",
    picture: pic("sea", "water", [
      { s: "whale", x: 210, y: 160, scale: 1.4, anim: "bob" },
      { s: "heart", x: 70, y: 150, scale: 0.7 },
      { s: "star", x: 330, y: 80, scale: 0.45, anim: "twinkle" },
    ]),
    ending: { id: "tidesong", title: "Tide Singer", sticker: "whale", note: "A forgotten middle is a fine place to try again." },
  }),
  scene({
    id: "end-shellgarden",
    title: "Shell Garden",
    text: "Flowers on a shell became a moving garden. The turtle smiled the whole slow way, and {{name}} swam alongside.",
    picture: pic("sea", "water", [
      { s: "turtle", x: 200, y: 165, scale: 1.35, anim: "bob" },
      { s: "flower", x: 120, y: 150, scale: 0.7, anim: "sway" },
      { s: "flower", x: 290, y: 150, scale: 0.7, anim: "sway" },
    ]),
    ending: { id: "shellgarden", title: "Shell Garden", sticker: "turtle", note: "Slow and kind still gets there." },
  }),
  scene({
    id: "end-penpal",
    title: "Royal Pen Pal",
    text: "{{name}} gave the queen a shell letter. It said, simply, hello. The queen wrote back, hello, and meant it.",
    picture: pic("sea", "water", [
      { s: "palace", x: 200, y: 155, scale: 1.3 },
      { s: "shell", x: 200, y: 175, scale: 0.8 },
      { s: "heart", x: 320, y: 120, scale: 0.65, anim: "bob" },
    ]),
    ending: { id: "penpal", title: "Royal Pen Pal", sticker: "shell", note: "Hello is a whole letter when it is kind." },
  }),
  scene({
    id: "end-kindcrown",
    title: "Kind Crown",
    text: "The smallest fish wore the crown. It was a little big, and absolutely right. {{name}} clapped with both hands, underwater, which made bubbles.",
    picture: pic("sea", "water", [
      { s: "fish", x: 200, y: 160, scale: 1.4, anim: "bob" },
      { s: "palace", x: 300, y: 150, scale: 0.8 },
      { s: "pearl", x: 120, y: 140, scale: 0.8, anim: "twinkle" },
    ]),
    ending: { id: "kindcrown", title: "Kind Crown", sticker: "pearl", note: "The kindest crown is the one you give." },
  }),
  scene({
    id: "end-pearlpincic",
    title: "Pearl Picnic",
    text: "Everyone looked at the pearl, then put it back for the reef. The picnic was seaweed sandwiches. {{name}} saved a corner for the octopus.",
    picture: pic("sea", "water", [
      { s: "pearl", x: 200, y: 140, scale: 1.2, anim: "twinkle" },
      { s: "fish", x: 100, y: 190, scale: 0.8 },
      { s: "octopus", x: 300, y: 180, scale: 0.8, anim: "bob" },
    ]),
    ending: { id: "pearlpincic", title: "Pearl Picnic", sticker: "fish", note: "Looking, then giving back, is a gentle kind of treasure." },
  }),
  scene({
    id: "end-baker",
    title: "Star Baker",
    text: "{{name}} sprinkled star-sugar. The cake glowed like a tiny moon. The crabs cheered with their claws, softly, so the frosting stayed put.",
    picture: pic("candy", "sand", [
      { s: "cake", x: 200, y: 165, scale: 1.4 },
      { s: "star", x: 140, y: 90, scale: 0.5, anim: "twinkle" },
      { s: "star", x: 260, y: 80, scale: 0.4, anim: "twinkle" },
      { s: "crab", x: 310, y: 190, scale: 0.8 },
    ]),
    ending: { id: "baker", title: "Star Baker", sticker: "cake", note: "Adding a little sweetness is a real help." },
  }),
  scene({
    id: "end-reefshare",
    title: "Reef Share",
    text: "Crabs, fish, and {{name}} shared every slice. Even the shy octopus took one. There was enough. There usually is, when you share.",
    picture: pic("sunset", "sand", [
      { s: "cake", x: 200, y: 170, scale: 1.1 },
      { s: "crab", x: 100, y: 185, scale: 0.85, anim: "bob" },
      { s: "fish", x: 310, y: 170, scale: 0.9, anim: "drift" },
      { s: "heart", x: 200, y: 80, scale: 0.7 },
    ]),
    ending: { id: "reefshare", title: "Reef Share", sticker: "crab", note: "A shared slice can feed a whole reef of friends." },
  }),
];

function pack(id: string, title: string, blurb: string, start: string, scenes: Scene[]): World {
  return {
    id,
    title,
    blurb,
    start,
    scenes: Object.fromEntries(scenes.map((item) => [item.id, item])),
  };
}

export const WORLDS: World[] = [
  pack(
    "starlight",
    "Starlight Voyage",
    "A gentle trip past moons, comets, and kites.",
    "pad",
    starlightScenes,
  ),
  pack(
    "whisperwood",
    "Whisperwood",
    "Lanterns, fox tea, and a shy unicorn.",
    "gate",
    forestScenes,
  ),
  pack(
    "coral",
    "Coral Crown",
    "Bubbles, songs, and kind crowns under the sea.",
    "shore",
    coralScenes,
  ),
];

export function worldById(id: string): World | undefined {
  return WORLDS.find((world) => world.id === id);
}
