const emergencyKeywords = [
    "chest pain",
    "difficulty breathing",
    "shortness of breath",
    "stroke",
    "seizure",
    "unconscious",
    "suicidal",
    "heart attack",
    "severe bleeding",
];

type Message = {
    content: string;
};

export function detectEmergencySymptoms(messages: Message[]) {
    const combinedText = messages
        .map((msg) => msg.content.toLowerCase())
        .join(" ");

    const matchedKeywords = emergencyKeywords.filter((keyword) =>
        combinedText.includes(keyword)
    );

    return {
        isEmergency: matchedKeywords.length > 0,
        matchedKeywords,
    };
}