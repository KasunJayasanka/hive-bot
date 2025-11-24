// app/api/rag/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embedTexts } from "@/lib/embeddings";
import { generateContent } from "@/lib/geminiClient";
import { analyzeImage } from "@/lib/vision";

// Helper function to detect greetings and chitchat
function isGreetingOrChitchat(message: string): string | null {
    const normalized = message.toLowerCase().trim();

    // Greetings
    const greetings = [
        'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
        'good evening', 'howdy', 'sup', 'yo', "what's up", 'whats up'
    ];

    // Gratitude
    const thanks = [
        'thank you', 'thanks', 'thx', 'thank u', 'ty', 'appreciated',
        'appreciate it', 'many thanks'
    ];

    // Farewells
    const farewells = [
        'bye', 'goodbye', 'see you', 'see ya', 'later', 'farewell',
        'take care', 'have a good day'
    ];

    // Casual small talk
    const smallTalk = [
        'how are you', 'how r u', 'how are u',
        'how is your day', "how's your day", 'hows your day',
        'how is the day', "how's the day", 'hows the day',
        "how's it going", 'hows it going', 'how is it going',
        "how've you been", 'how have you been',
        "what's new", 'whats new',
        'how do you do',
        'how are things',
        'how are you doing'
    ];

    // Check for exact matches or very short messages
    if (greetings.some(g => normalized === g || normalized.startsWith(g + ' '))) {
        return "greeting";
    }

    if (thanks.some(t => normalized.includes(t))) {
        return "thanks";
    }

    if (farewells.some(f => normalized === f || normalized.includes(f))) {
        return "farewell";
    }

    // Check for small talk patterns
    if (smallTalk.some(s => normalized.includes(s))) {
        return "smalltalk";
    }

    return null;
}

// Detect identity/meta questions about the bot
function isIdentityQuestion(message: string): boolean {
    const normalized = message.toLowerCase().trim();

    const identityPatterns = [
        'who are you',
        'what are you',
        'what is your name',
        "what's your name",
        'who made you',
        'who created you',
        'what can you do',
        'what do you do',
        'tell me about yourself',
        'introduce yourself',
        'your name',
        'your purpose',
        'what is hive bot',
        'who is hive bot'
    ];

    return identityPatterns.some(pattern => normalized.includes(pattern));
}

// Deduplicate results to prevent too many chunks from the same URL
function deduplicateResults<T extends { url?: string | null; similarity?: number | null }>(
    results: T[],
    maxPerUrl: number = 2
): T[] {
    const urlCounts = new Map<string, number>();
    const deduplicated: T[] = [];

    // Results are already sorted by similarity (highest first)
    for (const result of results) {
        const url = result.url ?? "unknown";
        const count = urlCounts.get(url) ?? 0;

        // Allow up to maxPerUrl chunks from the same URL
        if (count < maxPerUrl) {
            deduplicated.push(result);
            urlCounts.set(url, count + 1);
        }
    }

    return deduplicated;
}

// Generate chitchat responses
function getChitchatResponse(type: string): string {
    const responses = {
        greeting: [
            "Hey there! 👋 How can I help you today?",
            "Hi! 👋 What can I assist you with?",
            "Hello! 👋 I'm here to help. What would you like to know?",
        ],
        thanks: [
            "You're welcome! 😊 Let me know if you need anything else.",
            "Happy to help! Feel free to ask if you have more questions.",
            "Anytime! I'm here if you need more information.",
        ],
        farewell: [
            "Goodbye! Feel free to come back anytime. 👋",
            "Take care! Let me know if you need help later.",
            "See you! Don't hesitate to reach out if you have questions. 👋",
        ],
        smalltalk: [
            "I'm doing great, thanks for asking! 😊 How can I help you with information from the website today?",
            "I'm here and ready to help! Is there anything specific you'd like to know about?",
            "All good here! I'm ready to answer your questions. What would you like to know?",
            "Doing well, thank you! What brings you here today? I'm happy to help with any questions.",
        ]
    };

    const options = responses[type as keyof typeof responses] || responses.greeting;
    return options[Math.floor(Math.random() * options.length)];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, file, topK = 6, minSim = 0.25 } = body;

        if (!message?.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const trimmedMessage = message.trim();

        // Check for greetings/chitchat or identity questions
        const chitchatType = isGreetingOrChitchat(trimmedMessage);
        if (chitchatType) {
            return NextResponse.json({
                text: getChitchatResponse(chitchatType),
                sources: [],
                isChitchat: true
            });
        }

        // Handle identity/meta questions without needing context
        if (isIdentityQuestion(trimmedMessage)) {
            const identityResponse = await generateContent([{
                text: `You are Hive Bot, a helpful AI assistant. Answer this question naturally and conversationally: "${trimmedMessage}"`
            }]);
            
            return NextResponse.json({
                text: identityResponse,
                sources: [],
                isChitchat: true
            });
        }

        // 1) Build search query (include image analysis if present)
        let searchQuery = trimmedMessage;

        if (file?.data && file?.mime_type) {
            try {
                const imageData = await analyzeImage(file);
                const imageContext = [
                    imageData.ocr,
                    imageData.caption,
                    ...imageData.entities
                ].filter(Boolean).join(" ");

                if (imageContext) {
                    searchQuery = `${trimmedMessage} ${imageContext}`;
                }
            } catch (err) {
                console.error("Image analysis failed:", err);
            }
        }

        // 2) Embed the search query
        const [queryVec] = await embedTexts([searchQuery]);

        // 3) Vector similarity search in Supabase
        // Fetch more results initially for better deduplication
        const { data: matches, error: dbError } = await supabaseAdmin.rpc(
            "match_documents",
            {
                query_embedding: queryVec,
                match_count: topK * 3, // Fetch 3x to allow for deduplication
                match_threshold: minSim,
            }
        );

        if (dbError) {
            console.error("Supabase search error:", dbError);
            throw new Error("Database search failed");
        }

        // 4) Check if we found relevant context
        if (!matches || matches.length === 0) {
            return NextResponse.json({
                text: "I couldn't find relevant information in the website content to answer your question. Could you try rephrasing or asking something else?",
                sources: [],
            });
        }

        // 5) Deduplicate results to prevent redundant chunks from same URL
        type MatchRow = {
            url?: string | null;
            content?: string | null;
            similarity?: number | null;
        };

        const deduplicatedMatches = deduplicateResults(matches as MatchRow[], 2);

        // Take top K after deduplication
        const finalMatches = deduplicatedMatches.slice(0, topK);

        // 6) Build context from top matches
        const context = finalMatches.map((m) => ({
            url: m.url ?? "Unknown source",
            text: m.content ?? "",
            similarity: m.similarity ?? 0,
        }));

        // 7) Create the prompt with updated system message
        const systemPrompt = `You are Hive Bot, a helpful AI assistant that answers questions using website content.

Your role:
- Answer questions based on the context provided below
- Be conversational, friendly, and helpful
- If the exact answer isn't in the context but related information is, provide what you can
- If you truly cannot answer from the context, say "I don't have enough information about that in the website content"
- Cite sources naturally in your response (e.g., "According to [Source 1]...")
- For general questions about yourself, you can answer without needing website context`;

        const contextText = context
            .map((c, i) => `[Source ${i + 1}: ${c.url}]\n${c.text.slice(0, 1000)}`)
            .join("\n\n---\n\n");

        const userPrompt = `Context from website:\n\n${contextText}\n\nUser question: ${trimmedMessage}\n\nProvide a helpful answer using the context above.`;

        // 8) Generate response with Gemini
        type GeminiPart = {
            text?: string;
            inline_data?: {
                data: string;
                mime_type: string;
            };
        };

        const parts: GeminiPart[] = [
            { text: systemPrompt },
            { text: userPrompt }
        ];

        // Add image if present
        if (file?.data && file?.mime_type) {
            parts.push({
                inline_data: {
                    data: file.data,
                    mime_type: file.mime_type
                }
            });
        }

        const answer = await generateContent(parts);

        // 9) Extract unique source URLs
        const sources = [...new Set(context.map((c) => c.url))].slice(0, 3);

        return NextResponse.json({
            text: answer,
            sources,
        });

    } catch (error) {
        console.error("RAG ask error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}