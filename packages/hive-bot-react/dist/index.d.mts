import * as react from 'react';
import react__default, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    file?: {
        url: string;
        type: string;
        name: string;
    };
    sources?: Source[];
}
interface Source {
    url: string;
    title: string;
    similarity?: number;
}
interface HiveBotTheme {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    userMessageBg?: string;
    botMessageBg?: string;
    headerGradient?: string;
}
interface HiveBotConfig {
    /** API endpoint for sending messages (required) */
    apiEndpoint: string;
    /** Optional API key or authorization header */
    apiKey?: string;
    /** Additional headers to send with requests */
    headers?: Record<string, string>;
    /** Custom theme configuration */
    theme?: HiveBotTheme;
    /** Initial greeting message */
    greeting?: string;
    /** Placeholder text for input */
    placeholder?: string;
    /** Enable emoji picker (default: true) */
    enableEmoji?: boolean;
    /** Enable file upload (default: true) */
    enableFileUpload?: boolean;
    /** Maximum file size in bytes (default: 10MB) */
    maxFileSize?: number;
    /** Accepted file types (default: ['image/*']) */
    acceptedFileTypes?: string[];
    /** Show sources/citations (default: true) */
    showSources?: boolean;
    /** Enable 3D bee character (default: true) */
    enable3DCharacter?: boolean;
    /** Custom bot name (default: 'Hive Bot') */
    botName?: string;
    /** Custom bot description */
    botDescription?: string;
    /** Callback fired when user sends a message */
    onMessage?: (message: Message) => void;
    /** Callback fired when bot responds */
    onBotResponse?: (message: Message) => void;
    /** Callback fired on errors */
    onError?: (error: Error) => void;
    /** Custom message renderer component */
    customMessageRenderer?: React.ComponentType<{
        message: Message;
    }>;
    /** Custom header component */
    customHeader?: React.ComponentType;
    /** Custom input component */
    customInput?: React.ComponentType<{
        onSend: (text: string, file?: File) => void;
        disabled?: boolean;
    }>;
}
interface ChatWidgetProps {
    /** Position of the chat widget (default: 'bottom-right') */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Z-index for the widget (default: 1000) */
    zIndex?: number;
    /** Custom class name for styling */
    className?: string;
    /** Initial open state (default: false) */
    defaultOpen?: boolean;
    /** Controlled open state */
    isOpen?: boolean;
    /** Callback when open state changes */
    onOpenChange?: (isOpen: boolean) => void;
}
interface ApiResponse {
    text: string;
    sources?: Source[];
    error?: string;
}
interface SendMessageOptions {
    message: string;
    file?: File;
}

interface HiveBotContextValue {
    config: Required<HiveBotConfig>;
    messages: Message[];
    isLoading: boolean;
    sendMessage: (text: string, file?: File) => Promise<void>;
    clearMessages: () => void;
}
declare const useHiveBot: () => HiveBotContextValue;
interface HiveBotProviderProps {
    children: ReactNode;
    config?: Partial<HiveBotConfig>;
    apiEndpoint: string;
    apiKey?: string;
    headers?: Record<string, string>;
    theme?: HiveBotConfig['theme'];
    greeting?: string;
    placeholder?: string;
    enableEmoji?: boolean;
    enableFileUpload?: boolean;
    maxFileSize?: number;
    acceptedFileTypes?: string[];
    showSources?: boolean;
    enable3DCharacter?: boolean;
    botName?: string;
    botDescription?: string;
    onMessage?: HiveBotConfig['onMessage'];
    onBotResponse?: HiveBotConfig['onBotResponse'];
    onError?: HiveBotConfig['onError'];
    customMessageRenderer?: HiveBotConfig['customMessageRenderer'];
    customHeader?: HiveBotConfig['customHeader'];
    customInput?: HiveBotConfig['customInput'];
}
declare const HiveBotProvider: react__default.FC<HiveBotProviderProps>;

declare function HiveBot({ className, style }: {
    className?: string;
    style?: React.CSSProperties;
}): react_jsx_runtime.JSX.Element;

declare function ChatWidget({ position, zIndex, className, defaultOpen, isOpen: controlledOpen, onOpenChange, }: ChatWidgetProps): react_jsx_runtime.JSX.Element;

declare function ChatHeader(): react_jsx_runtime.JSX.Element;

declare function ChatInput(): react_jsx_runtime.JSX.Element;

interface ChatMessagesProps {
    messages: Message[];
    isLoading: boolean;
}
declare const ChatMessages: react.ForwardRefExoticComponent<ChatMessagesProps & react.RefAttributes<HTMLDivElement>>;

interface MessageBubbleProps {
    message: Message;
    isThinking?: boolean;
}
declare function MessageBubble({ message, isThinking }: MessageBubbleProps): react_jsx_runtime.JSX.Element;

declare function BeeCharacter({ className }: {
    className?: string;
}): react_jsx_runtime.JSX.Element;

interface SourcesListProps {
    sources: Source[];
}
declare function SourcesList({ sources }: SourcesListProps): react_jsx_runtime.JSX.Element | null;

declare function ThinkingDots(): react_jsx_runtime.JSX.Element;

interface EmojiPopoverProps {
    onSelect: (emoji: string) => void;
    className?: string;
}
declare function EmojiPopover({ onSelect, className }: EmojiPopoverProps): react_jsx_runtime.JSX.Element;

export { type ApiResponse, BeeCharacter, ChatHeader, ChatInput, ChatMessages, ChatWidget, type ChatWidgetProps, EmojiPopover, HiveBot, type HiveBotConfig, HiveBotProvider, type HiveBotTheme, type Message, MessageBubble, type SendMessageOptions, type Source, SourcesList, ThinkingDots, useHiveBot };
