const GREETINGS = [
    {
        max: 5,
        messages: ["Bonne nuit,", "Encore réveillé,", "Il se fait tard,"],
    },
    {
        max: 12,
        messages: ["Bonjour,", "Belle journée,", "Bien dormi,"],
    },
    {
        max: 18,
        messages: ["Bon après-midi,", "Courage,"],
    },
    {
        max: 22,
        messages: ["Bonsoir,", "Bonne fin de journée,", "Détends-toi un peu,"],
    },
    {
        max: 24,
        messages: ["Bonne nuit,", "Il est temps de te reposer,", "Dors bien,"],
    },
];

function getGreetingMessage() {
    const heure = new Date().getHours();
    const tranche = GREETINGS.find(({ max }) => heure < max);
    const messages = tranche.messages;
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
}

export default getGreetingMessage;

