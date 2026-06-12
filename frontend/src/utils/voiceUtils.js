export const summaries = {
  English: ({ income, expenses, savings, highest, overspent, bills }) =>
    `Your total income is ${income}. Total expenses are ${expenses}. Savings are ${savings}. Highest spending category is ${highest}. Overspent categories: ${overspent}. Upcoming bills: ${bills}.`,
  Sinhala: ({ income, expenses, savings, highest, overspent, bills }) =>
    `ඔබගේ මුළු ආදායම ${income}. මුළු වියදම් ${expenses}. ඉතුරුම් ${savings}. වැඩිම වියදම් කාණ්ඩය ${highest}. අයවැය ඉක්මවූ කාණ්ඩ: ${overspent}. ඉදිරි බිල්පත්: ${bills}.`,
  Tamil: ({ income, expenses, savings, highest, overspent, bills }) =>
    `உங்கள் மொத்த வருமானம் ${income}. மொத்த செலவுகள் ${expenses}. சேமிப்பு ${savings}. அதிக செலவு செய்த பிரிவு ${highest}. பட்ஜெட்டை மீறிய பிரிவுகள்: ${overspent}. வரவிருக்கும் பில்கள்: ${bills}.`
};

export const categoryTranslations = {
  English: { None: "None" },
  Sinhala: {
    Food: "ආහාර",
    Transport: "ප්‍රවාහන",
    Water: "ජලය",
    Electricity: "විදුලිය",
    Phone: "දුරකථන",
    Rent: "කුලී",
    Education: "අධ්‍යාපන",
    Health: "සෞඛ්‍ය",
    Entertainment: "විනෝදාස්වාද",
    Shopping: "මිලදී ගැනීම්",
    Miscellaneous: "වෙනත්",
    None: "නැත"
  },
  Tamil: {
    Food: "உணவு",
    Transport: "போக்குவரத்து",
    Water: "தண்ணீர்",
    Electricity: "மின்சாரம்",
    Phone: "தொலைபேசி",
    Rent: "வாடகை",
    Education: "கல்வி",
    Health: "சுகாதாரம்",
    Entertainment: "பொழுதுபோக்கு",
    Shopping: "கொள்முதல்",
    Miscellaneous: "மற்றவை",
    None: "இல்லை"
  }
};

export function translateCategory(value, language) {
  return categoryTranslations[language]?.[value] || value;
}

function languageCode(language) {
  if (language === "Sinhala") return "si-LK";
  if (language === "Tamil") return "ta-IN";
  return "en-US";
}

function getAvailableVoices() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    setTimeout(() => resolve(speechSynthesis.getVoices()), 600);
  });
}

export function speak(text, language) {
  if (!("speechSynthesis" in window)) {
    return { spoken: false, message: "Speech synthesis is not supported in this browser." };
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode(language);
  speechSynthesis.cancel();

  getAvailableVoices().then((voices) => {
    const prefix = utterance.lang.slice(0, 2).toLowerCase();
    const voice =
      voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  });

  return { spoken: true };
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
