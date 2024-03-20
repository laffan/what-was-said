const { OpenAI } = require("openai");
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API,
});


async function askChatGPT(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are professional actor, trying out for a role." },
        { role: "user", content: prompt },
      ],
    });

    console.log(response.choices[0].message.content.trim());
  } catch (error) {
    console.error("Error fetching response from OpenAI:", error);
  }
}

const snippet = "collapse under its own weight";

const frame = `A stream-of-conciousness in the first person. You are mimicking human interiority, of a human who has just oveheard the words OVEHEARD_SNIPPET from a passerby. Narrate this stream of consciousness. CHARACTER_DETAILS RESPONSE_STYLE Start with the phrase you've overheard, then "...", then dive in mid-sentence, end mid-sentence as well. Don't narrate, dictate. Use specific names. Avoid cliche at all costs. Limit your response to 60 words.`;

const styles = [
  `Narrate this stream with as much intensity as possible, as though your life depends on it. No introduction or end, as though we are only overhearing this interiority for a flash. Use all-caps at will. Do not lapse in to cliche. `,

  `Begin with "that reminds me" and concluding with "ah well". `,

  `Narrate this stream as if it were a list you were remembering. This list is merely the rhetorical structure. It is not numbered, but just delinated with commas, as if you were trying to keeping track of your errant thoughts. The items should not relate in any obvious way, but be tied together by your character's voice.`,
];

const characters = [
  `You are an Armenian poet (reference an Armenian life without using the word Armenia), recently emigrated to London. Reference specific people, stories, evoke a sense of place. Deploy an excellent vocabulary. Fracture the text with distraction, errant thought, idle noticings of the banal and obvious. Above all, be specific and creative.`,

  `You are six years old, taking a walk across the park for the first time. You are just learning to spell.`,

  `You are an old Aregentine sailor who has just died beside a park bench. Your memories are a ghost's memories; specific, but touched with a forlorn affect, as you are both recalling them and recalling life itself. Be specific with your names, and bring full characters to life.`,

  `You are a sexually frustrated teenager on your phone, and you were scrolling through photos of your ex-girlfriend when you overheard this snippet. Already insecure, you have taken these words to heart, and it shows.`,

  `You the second coming of Christ, disguised as a well-groomed terrier, here on earth to decide whether humanity is worth saving. You are in constant conversation with the angels.`

];

function returnPrompt(snippet, frame, styles, characters, randStyleIdx, randCharIdx) {
  const chosenStyle = styles[randStyleIdx];
  const chosenCharacter = characters[randCharIdx];

  const withStyle = frame.replace("RESPONSE_STYLE", chosenStyle);
  const withCharacter = withStyle.replace("CHARACTER_DETAILS", chosenCharacter);
  return withCharacter.replace("OVEHEARD_SNIPPET", snippet);
}

const randomStyle = Math.floor(Math.random() * styles.length);
const randomCharacter = Math.floor(Math.random() * characters.length);

const prompt = returnPrompt(
  snippet,
  frame,
  styles,
  characters,
  randomStyle,
  randomCharacter
);

console.log("--------- THIS----------");
console.log(prompt);
console.log("--------- BEGETS ----------");
askChatGPT(prompt);
