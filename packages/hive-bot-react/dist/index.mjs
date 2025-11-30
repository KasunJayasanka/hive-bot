import React2, { createContext, forwardRef, useContext, useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Bot, User, ExternalLink, X, Smile, Paperclip, Send, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

// src/context/HiveBotContext.tsx
var defaultConfig = {
  apiEndpoint: "/api/rag/ask",
  apiKey: "",
  headers: {},
  theme: {},
  greeting: "Hello! How can I help you today?",
  placeholder: "Type your message...",
  enableEmoji: true,
  enableFileUpload: true,
  maxFileSize: 10 * 1024 * 1024,
  // 10MB
  acceptedFileTypes: ["image/*"],
  showSources: true,
  enable3DCharacter: true,
  botName: "Hive Bot",
  botDescription: "AI Assistant",
  onMessage: () => {
  },
  onBotResponse: () => {
  },
  onError: (error) => console.error("HiveBot Error:", error),
  customMessageRenderer: void 0,
  customHeader: void 0,
  customInput: void 0
};
var HiveBotContext = createContext(null);
var useHiveBot = () => {
  const context = useContext(HiveBotContext);
  if (!context) {
    throw new Error("useHiveBot must be used within HiveBotProvider");
  }
  return context;
};
var HiveBotProvider = ({
  children,
  config: configProp,
  apiEndpoint,
  ...props
}) => {
  const config = {
    ...defaultConfig,
    ...configProp,
    apiEndpoint,
    ...props.apiKey !== void 0 && { apiKey: props.apiKey },
    ...props.headers !== void 0 && { headers: props.headers },
    ...props.theme !== void 0 && { theme: props.theme },
    ...props.greeting !== void 0 && { greeting: props.greeting },
    ...props.placeholder !== void 0 && { placeholder: props.placeholder },
    ...props.enableEmoji !== void 0 && { enableEmoji: props.enableEmoji },
    ...props.enableFileUpload !== void 0 && { enableFileUpload: props.enableFileUpload },
    ...props.maxFileSize !== void 0 && { maxFileSize: props.maxFileSize },
    ...props.acceptedFileTypes !== void 0 && { acceptedFileTypes: props.acceptedFileTypes },
    ...props.showSources !== void 0 && { showSources: props.showSources },
    ...props.enable3DCharacter !== void 0 && { enable3DCharacter: props.enable3DCharacter },
    ...props.botName !== void 0 && { botName: props.botName },
    ...props.botDescription !== void 0 && { botDescription: props.botDescription },
    ...props.onMessage !== void 0 && { onMessage: props.onMessage },
    ...props.onBotResponse !== void 0 && { onBotResponse: props.onBotResponse },
    ...props.onError !== void 0 && { onError: props.onError },
    ...props.customMessageRenderer !== void 0 && { customMessageRenderer: props.customMessageRenderer },
    ...props.customHeader !== void 0 && { customHeader: props.customHeader },
    ...props.customInput !== void 0 && { customInput: props.customInput }
  };
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: config.greeting,
      sender: "bot",
      timestamp: /* @__PURE__ */ new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const sendMessage = useCallback(
    async (text, file) => {
      const userMessage = {
        id: generateId(),
        text,
        sender: "user",
        timestamp: /* @__PURE__ */ new Date(),
        ...file && {
          file: {
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name
          }
        }
      };
      setMessages((prev) => [...prev, userMessage]);
      config.onMessage?.(userMessage);
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("message", text);
        if (file) {
          formData.append("file", file);
        }
        const headers = {
          ...config.headers
        };
        if (config.apiKey) {
          headers["Authorization"] = `Bearer ${config.apiKey}`;
        }
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers,
          body: formData
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const botMessage = {
          id: generateId(),
          text: data.text,
          sender: "bot",
          timestamp: /* @__PURE__ */ new Date(),
          sources: data.sources
        };
        setMessages((prev) => [...prev, botMessage]);
        config.onBotResponse?.(botMessage);
      } catch (error) {
        const errorMessage = {
          id: generateId(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: /* @__PURE__ */ new Date()
        };
        setMessages((prev) => [...prev, errorMessage]);
        config.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "1",
        text: config.greeting,
        sender: "bot",
        timestamp: /* @__PURE__ */ new Date()
      }
    ]);
  }, [config.greeting]);
  return /* @__PURE__ */ jsx(
    HiveBotContext.Provider,
    {
      value: {
        config,
        messages,
        isLoading,
        sendMessage,
        clearMessages
      },
      children
    }
  );
};
function Bee() {
  const beeRef = useRef(null);
  const leftWingRef = useRef(null);
  const rightWingRef = useRef(null);
  useFrame((state) => {
    if (!beeRef.current) return;
    const time = state.clock.getElapsedTime();
    beeRef.current.position.y = Math.sin(time * 2) * 0.1;
    beeRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    if (leftWingRef.current && rightWingRef.current) {
      const wingFlap = Math.sin(time * 20) * 0.3;
      leftWingRef.current.rotation.y = -Math.PI / 4 + wingFlap;
      rightWingRef.current.rotation.y = Math.PI / 4 - wingFlap;
    }
  });
  const yellowColor = "#FFD700";
  const blackColor = "#1a1a1a";
  const wingColor = "#E0F4FF";
  const eyeColor = "#000000";
  return /* @__PURE__ */ jsxs("group", { ref: beeRef, position: [0, 0, 0], children: [
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0.5, 0.6], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.35, 32, 32] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor, roughness: 0.4, metalness: 0.1 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [-0.2, 0.55, 0.75], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.15, 16, 16] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: eyeColor, roughness: 0.2, metalness: 0.8 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0.2, 0.55, 0.75], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.15, 16, 16] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: eyeColor, roughness: 0.2, metalness: 0.8 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [-0.25, 0.6, 0.85], children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.05, 8, 8] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffffff" })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0.25, 0.6, 0.85], children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.05, 8, 8] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffffff" })
    ] }),
    /* @__PURE__ */ jsxs("group", { position: [-0.15, 0.75, 0.6], children: [
      /* @__PURE__ */ jsxs("mesh", { position: [0, 0.15, 0], rotation: [0.3, -0.2, 0], castShadow: true, children: [
        /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.02, 0.02, 0.3, 8] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
      ] }),
      /* @__PURE__ */ jsxs("mesh", { position: [0, 0.35, 0.05], children: [
        /* @__PURE__ */ jsx("sphereGeometry", { args: [0.04, 8, 8] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("group", { position: [0.15, 0.75, 0.6], children: [
      /* @__PURE__ */ jsxs("mesh", { position: [0, 0.15, 0], rotation: [0.3, 0.2, 0], castShadow: true, children: [
        /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.02, 0.02, 0.3, 8] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
      ] }),
      /* @__PURE__ */ jsxs("mesh", { position: [0, 0.35, 0.05], children: [
        /* @__PURE__ */ jsx("sphereGeometry", { args: [0.04, 8, 8] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0.3, 0], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.4, 32, 32] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor, roughness: 0.9 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0.15, -0.35], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: yellowColor, roughness: 0.6 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0.1, -0.6], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor, roughness: 0.6 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0.05, -0.8], castShadow: true, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: yellowColor, roughness: 0.6 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0, -1.05], rotation: [Math.PI / 2, 0, 0], castShadow: true, children: [
      /* @__PURE__ */ jsx("coneGeometry", { args: [0.08, 0.25, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#2a2a2a", metalness: 0.3 })
    ] }),
    /* @__PURE__ */ jsxs(
      "mesh",
      {
        ref: leftWingRef,
        position: [-0.35, 0.4, -0.1],
        rotation: [0.2, -Math.PI / 4, 0.1],
        castShadow: true,
        children: [
          /* @__PURE__ */ jsx("boxGeometry", { args: [0.8, 0.02, 0.5] }),
          /* @__PURE__ */ jsx(
            "meshPhysicalMaterial",
            {
              color: wingColor,
              transparent: true,
              opacity: 0.3,
              roughness: 0.1,
              metalness: 0.1,
              clearcoat: 1
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "mesh",
      {
        ref: rightWingRef,
        position: [0.35, 0.4, -0.1],
        rotation: [0.2, Math.PI / 4, -0.1],
        castShadow: true,
        children: [
          /* @__PURE__ */ jsx("boxGeometry", { args: [0.8, 0.02, 0.5] }),
          /* @__PURE__ */ jsx(
            "meshPhysicalMaterial",
            {
              color: wingColor,
              transparent: true,
              opacity: 0.3,
              roughness: 0.1,
              metalness: 0.1,
              clearcoat: 1
            }
          )
        ]
      }
    ),
    ["front", "middle", "back"].map((type, idx) => {
      const positions = [
        [0.3, 0.2, 0.3],
        [0.35, 0.15, -0.1],
        [0.35, 0.1, -0.4]
      ];
      const rotations = [0.5, 0.7, 0.8];
      const heights = [0.3, 0.35, 0.35];
      return /* @__PURE__ */ jsxs(React2.Fragment, { children: [
        /* @__PURE__ */ jsxs("group", { position: [-positions[idx][0], positions[idx][1], positions[idx][2]], children: [
          /* @__PURE__ */ jsxs("mesh", { position: [0, -0.15 - idx * 0.05, 0], rotation: [0, 0, rotations[idx]], castShadow: true, children: [
            /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.03, 0.03, heights[idx], 8] }),
            /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
          ] }),
          /* @__PURE__ */ jsxs(
            "mesh",
            {
              position: [0, -0.3 - idx * 0.1, 0.1 + idx * 0.05],
              rotation: [0.5 + idx * 0.1, 0, rotations[idx]],
              castShadow: true,
              children: [
                /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.025, 0.025, 0.25 + idx * 0.025, 8] }),
                /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("group", { position: [positions[idx][0], positions[idx][1], positions[idx][2]], children: [
          /* @__PURE__ */ jsxs("mesh", { position: [0, -0.15 - idx * 0.05, 0], rotation: [0, 0, -rotations[idx]], castShadow: true, children: [
            /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.03, 0.03, heights[idx], 8] }),
            /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
          ] }),
          /* @__PURE__ */ jsxs(
            "mesh",
            {
              position: [0, -0.3 - idx * 0.1, 0.1 + idx * 0.05],
              rotation: [0.5 + idx * 0.1, 0, -rotations[idx]],
              castShadow: true,
              children: [
                /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.025, 0.025, 0.25 + idx * 0.025, 8] }),
                /* @__PURE__ */ jsx("meshStandardMaterial", { color: blackColor })
              ]
            }
          )
        ] })
      ] }, type);
    })
  ] });
}
function BeeCharacter({ className = "" }) {
  return /* @__PURE__ */ jsx("div", { className, style: { width: "100%", height: "100%" }, children: /* @__PURE__ */ jsxs(Canvas, { shadows: true, style: { width: "100%", height: "100%" }, children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 1, 4], fov: 50 }),
    /* @__PURE__ */ jsx("ambientLight", { intensity: 0.6 }),
    /* @__PURE__ */ jsx("directionalLight", { position: [5, 5, 5], intensity: 1, castShadow: true, "shadow-mapSize": [1024, 1024] }),
    /* @__PURE__ */ jsx("pointLight", { position: [-5, 5, 5], intensity: 0.5 }),
    /* @__PURE__ */ jsx("spotLight", { position: [0, 5, 0], angle: 0.3, penumbra: 1, intensity: 0.5, castShadow: true }),
    /* @__PURE__ */ jsx(Bee, {}),
    /* @__PURE__ */ jsx(
      OrbitControls,
      {
        enableZoom: false,
        enablePan: false,
        autoRotate: true,
        autoRotateSpeed: 1,
        minPolarAngle: Math.PI / 3,
        maxPolarAngle: Math.PI / 2
      }
    )
  ] }) });
}
function ChatHeader() {
  const { config } = useHiveBot();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "hivebot-header",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: config.theme?.headerGradient || "linear-gradient(to right, #6366f1, #9333ea)",
        color: "white",
        padding: "1rem",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem" }, children: [
          config.enable3DCharacter && /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(4px)",
                overflow: "hidden"
              },
              children: /* @__PURE__ */ jsx(BeeCharacter, {})
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: "1.125rem" }, children: config.botName }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: "0.75rem", opacity: 0.9 }, children: config.botDescription })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              fontSize: "0.75rem",
              opacity: 0.8,
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backdropFilter: "blur(4px)"
            },
            children: "Live Assistance"
          }
        )
      ]
    }
  );
}
function ThinkingDots() {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.25rem" }, children: [
    [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "currentColor",
          opacity: 0.6,
          animation: "pulse 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`
        }
      },
      i
    )),
    /* @__PURE__ */ jsx("span", { style: { marginLeft: "0.5rem", fontSize: "0.875rem" }, children: "Thinking..." })
  ] });
}
function SourcesList({ sources }) {
  if (!sources || sources.length === 0) {
    return null;
  }
  const getDomainName = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };
  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + "...";
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "hivebot-sources",
      style: {
        marginTop: "0.75rem",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        paddingTop: "0.75rem"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsx(ExternalLink, { size: 16, style: { color: "var(--hivebot-primary, #6366f1)" } }),
          /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                opacity: 0.8
              },
              children: "Sources"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: sources.map((source, idx) => /* @__PURE__ */ jsxs(
          "a",
          {
            href: source.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "hivebot-source-link",
            style: {
              display: "flex",
              alignItems: "start",
              gap: "0.5rem",
              textDecoration: "none",
              color: "inherit"
            },
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    flexShrink: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    color: "var(--hivebot-primary, #6366f1)",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 500,
                    marginTop: "2px"
                  },
                  children: idx + 1
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      fontSize: "0.875rem",
                      color: "var(--hivebot-primary, #6366f1)",
                      wordBreak: "break-all"
                    },
                    children: source.title || getDomainName(source.url)
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      fontSize: "0.75rem",
                      opacity: 0.6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    },
                    title: source.url,
                    children: truncateUrl(source.url)
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(ExternalLink, { size: 14, style: { flexShrink: 0, marginTop: "4px", opacity: 0.4 } })
            ]
          },
          idx
        )) })
      ]
    }
  );
}
function MessageBubble({ message, isThinking = false }) {
  const isUser = message.sender === "user";
  const showThinking = isThinking && !message.text;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clsx("hivebot-message", isUser ? "hivebot-message-user" : "hivebot-message-bot"),
      style: {
        display: "flex",
        gap: "0.75rem",
        justifyContent: isUser ? "flex-end" : "flex-start"
      },
      children: [
        !isUser && /* @__PURE__ */ jsx(
          "div",
          {
            className: "hivebot-avatar hivebot-avatar-bot",
            style: {
              flexShrink: 0,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(to bottom right, #6366f1, #9333ea)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            },
            children: /* @__PURE__ */ jsx(Bot, { size: 16, color: "white" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              maxWidth: "75%",
              alignItems: isUser ? "flex-end" : "flex-start"
            },
            children: [
              message.file?.url && /* @__PURE__ */ jsx(
                "div",
                {
                  className: "hivebot-message-image",
                  style: {
                    position: "relative",
                    width: "256px",
                    aspectRatio: "16/9",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.1)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  },
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: message.file.url,
                      alt: "attachment",
                      style: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }
                    }
                  )
                }
              ),
              (message.text || showThinking) && /* @__PURE__ */ jsx(
                "div",
                {
                  className: clsx("hivebot-bubble", isUser ? "hivebot-bubble-user" : "hivebot-bubble-bot"),
                  style: {
                    padding: "0.75rem 1rem",
                    borderRadius: "1rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    maxWidth: "100%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    ...isUser ? {
                      backgroundColor: "var(--hivebot-user-bg, #6366f1)",
                      color: "white",
                      borderBottomRightRadius: "0.25rem"
                    } : {
                      backgroundColor: "var(--hivebot-bot-bg, white)",
                      color: "var(--hivebot-text, #1f2937)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderBottomLeftRadius: "0.25rem"
                    }
                  },
                  children: showThinking ? /* @__PURE__ */ jsx("div", { style: { color: "var(--hivebot-text-muted, #6b7280)" }, children: /* @__PURE__ */ jsx(ThinkingDots, {}) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { className: "hivebot-message-content", style: { fontSize: "0.9375rem", lineHeight: 1.6 }, children: isUser ? message.text : /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: message.text || "" }) }),
                    message.sources && message.sources.length > 0 && /* @__PURE__ */ jsx(SourcesList, { sources: message.sources })
                  ] })
                }
              )
            ]
          }
        ),
        isUser && /* @__PURE__ */ jsx(
          "div",
          {
            className: "hivebot-avatar hivebot-avatar-user",
            style: {
              flexShrink: 0,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            },
            children: /* @__PURE__ */ jsx(User, { size: 16, color: "white" })
          }
        )
      ]
    }
  );
}
var ChatMessages = forwardRef(
  ({ messages, isLoading }, ref) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: "hivebot-messages",
        style: {
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          backgroundColor: "var(--hivebot-bg, #f9fafb)",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch"
        },
        children: [
          messages.map((message) => /* @__PURE__ */ jsx(MessageBubble, { message }, message.id)),
          isLoading && /* @__PURE__ */ jsx(
            MessageBubble,
            {
              message: {
                id: "thinking",
                text: "",
                sender: "bot",
                timestamp: /* @__PURE__ */ new Date()
              },
              isThinking: true
            }
          )
        ]
      }
    );
  }
);
ChatMessages.displayName = "ChatMessages";
function EmojiPopover({ onSelect, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    import('emoji-picker-element');
  }, []);
  useEffect(() => {
    const picker = ref.current;
    if (!picker) return;
    picker.style.display = "block";
    picker.style.width = "100%";
    const handler = (e) => {
      const custom = e;
      onSelect(custom?.detail?.unicode ?? "");
    };
    picker.addEventListener("emoji-click", handler);
    return () => picker.removeEventListener("emoji-click", handler);
  }, [onSelect]);
  return /* @__PURE__ */ jsx("div", { className: `hivebot-emoji-popover ${className}`, children: /* @__PURE__ */ jsx("emoji-picker", { ref, class: "responsive-emoji-picker" }) });
}
function ChatInput() {
  const { config, isLoading, sendMessage } = useHiveBot();
  const [input, setInput] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const [emojiPos, setEmojiPos] = useState(null);
  useLayoutEffect(() => {
    if (!emojiOpen || !emojiBtnRef.current) return;
    const r = emojiBtnRef.current.getBoundingClientRect();
    const GAP = 12;
    const PICKER_W = 360;
    const PICKER_H = 420;
    const left = Math.max(8, Math.min(r.right - PICKER_W, window.innerWidth - 8 - PICKER_W));
    const top = Math.max(8, r.top - GAP - PICKER_H);
    setEmojiPos({ left, top });
  }, [emojiOpen]);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > config.maxFileSize) {
      alert(`File size must be less than ${Math.round(config.maxFileSize / 1024 / 1024)}MB`);
      return;
    }
    setPendingFile(file);
    setFilePreview(URL.createObjectURL(file));
    e.target.value = "";
  };
  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setPendingFile(null);
    setFilePreview(null);
  };
  const handleSend = async () => {
    if (!input.trim() && !pendingFile) return;
    if (isLoading) return;
    const message = input.trim();
    const file = pendingFile;
    setInput("");
    removeFile();
    await sendMessage(message, file || void 0);
  };
  const insertEmojiAtCaret = (emoji) => {
    const el = textareaRef.current;
    if (!el) {
      setInput(input + emoji);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + emoji.length;
      el.setSelectionRange(caret, caret);
    });
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const canSend = (input.trim() || pendingFile) && !isLoading;
  if (config.customInput) {
    const CustomInput = config.customInput;
    return /* @__PURE__ */ jsx(CustomInput, { onSend: sendMessage, disabled: isLoading });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "hivebot-input-container",
      style: {
        borderTop: "1px solid rgba(0,0,0,0.1)",
        backgroundColor: "white",
        padding: "1rem"
      },
      children: [
        pendingFile && filePreview && /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem",
              backgroundColor: "#f9fafb",
              borderRadius: "0.75rem",
              border: "1px solid rgba(0,0,0,0.1)"
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    position: "relative",
                    width: "48px",
                    height: "48px",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.1)"
                  },
                  children: /* @__PURE__ */ jsx("img", { src: filePreview, alt: "preview", style: { width: "100%", height: "100%", objectFit: "cover" } })
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, fontSize: "0.875rem" }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 500 }, children: "Image attached" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "Ready to send" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: removeFile,
                  style: {
                    padding: "0.25rem",
                    color: "#6b7280",
                    background: "none",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer"
                  },
                  title: "Remove",
                  children: /* @__PURE__ */ jsx(X, { size: 16 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "relative",
              backgroundColor: "#f9fafb",
              borderRadius: "1rem",
              border: "1px solid rgba(0,0,0,0.1)"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "end", gap: "0.5rem", padding: "0.75rem" }, children: [
                /* @__PURE__ */ jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    ref: textareaRef,
                    className: "hivebot-textarea",
                    placeholder: config.placeholder,
                    value: input,
                    onChange: (e) => setInput(e.target.value),
                    onKeyDown,
                    rows: 1,
                    style: {
                      width: "100%",
                      resize: "none",
                      outline: "none",
                      background: "transparent",
                      border: "none",
                      fontSize: "1rem",
                      lineHeight: 1.5,
                      minHeight: "24px",
                      maxHeight: "120px"
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }, children: [
                  config.enableEmoji && /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        ref: emojiBtnRef,
                        type: "button",
                        onClick: () => setEmojiOpen((v) => !v),
                        className: clsx("hivebot-btn hivebot-btn-icon", emojiOpen && "active"),
                        style: {
                          padding: "0.5rem",
                          borderRadius: "50%",
                          border: "none",
                          background: emojiOpen ? "rgba(99,102,241,0.1)" : "transparent",
                          color: emojiOpen ? "#6366f1" : "#6b7280",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        },
                        title: "Add emoji",
                        children: /* @__PURE__ */ jsx(Smile, { size: 18 })
                      }
                    ),
                    emojiOpen && emojiPos && typeof document !== "undefined" && createPortal(
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "hidden sm:block",
                          style: { position: "fixed", zIndex: 50, left: emojiPos.left, top: emojiPos.top },
                          children: /* @__PURE__ */ jsx(
                            EmojiPopover,
                            {
                              onSelect: (emoji) => {
                                insertEmojiAtCaret(emoji);
                                setEmojiOpen(false);
                              }
                            }
                          )
                        }
                      ),
                      document.body
                    ),
                    emojiOpen && /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "sm:hidden",
                        style: {
                          position: "fixed",
                          left: "1rem",
                          right: "1rem",
                          bottom: "8rem",
                          zIndex: 50,
                          borderRadius: "0.75rem",
                          overflow: "hidden",
                          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                          maxHeight: "65vh"
                        },
                        children: /* @__PURE__ */ jsx(
                          EmojiPopover,
                          {
                            onSelect: (emoji) => {
                              insertEmojiAtCaret(emoji);
                              setEmojiOpen(false);
                            }
                          }
                        )
                      }
                    )
                  ] }),
                  config.enableFileUpload && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => fileInputRef.current?.click(),
                      className: "hivebot-btn hivebot-btn-icon",
                      style: {
                        padding: "0.5rem",
                        borderRadius: "50%",
                        border: "none",
                        background: pendingFile ? "rgba(99,102,241,0.1)" : "transparent",
                        color: pendingFile ? "#6366f1" : "#6b7280",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      },
                      title: "Attach file",
                      children: /* @__PURE__ */ jsx(Paperclip, { size: 18 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleSend,
                      disabled: !canSend,
                      className: "hivebot-btn hivebot-btn-send",
                      style: {
                        padding: "0.5rem",
                        borderRadius: "50%",
                        border: "none",
                        background: canSend ? "var(--hivebot-primary, #6366f1)" : "#d1d5db",
                        color: "white",
                        cursor: canSend ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: canSend ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none"
                      },
                      title: "Send message",
                      children: isLoading ? /* @__PURE__ */ jsx("div", { style: { animation: "spin 1s linear infinite" }, children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          style: {
                            width: "16px",
                            height: "16px",
                            border: "2px solid currentColor",
                            borderTopColor: "transparent",
                            borderRadius: "50%"
                          }
                        }
                      ) }) : /* @__PURE__ */ jsx(Send, { size: 18 })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    padding: "0 0.75rem 0.5rem",
                    fontSize: "0.75rem",
                    color: "#6b7280"
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Press Enter to send \u2022 Shift+Enter for new line" }),
                    /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Tap send button or use Enter to send" })
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: config.acceptedFileTypes.join(","),
            hidden: true,
            onChange: handleFileChange
          }
        )
      ]
    }
  );
}
function HiveBot({ className = "", style = {} }) {
  const { messages, isLoading, config } = useHiveBot();
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `hivebot ${className}`,
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
        backgroundColor: "white",
        borderRadius: config.theme?.borderRadius || "1rem",
        overflow: "hidden",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        fontFamily: config.theme?.fontFamily || "system-ui, -apple-system, sans-serif",
        ...style
      },
      children: [
        config.customHeader ? /* @__PURE__ */ jsx(config.customHeader, {}) : /* @__PURE__ */ jsx(ChatHeader, {}),
        /* @__PURE__ */ jsx(ChatMessages, { messages, isLoading, ref: messagesEndRef }),
        /* @__PURE__ */ jsx(ChatInput, {})
      ]
    }
  );
}
function ChatWidget({
  position = "bottom-right",
  zIndex = 1e3,
  className = "",
  defaultOpen = false,
  isOpen: controlledOpen,
  onOpenChange
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== void 0;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const toggleOpen = () => {
    const newValue = !isOpen;
    if (!isControlled) {
      setInternalOpen(newValue);
    }
    onOpenChange?.(newValue);
  };
  const positionStyles = {
    "bottom-right": { bottom: "1.5rem", right: "1.5rem" },
    "bottom-left": { bottom: "1.5rem", left: "1.5rem" },
    "top-right": { top: "1.5rem", right: "1.5rem" },
    "top-left": { top: "1.5rem", left: "1.5rem" }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: `hivebot-widget ${className}`,
        style: {
          position: "fixed",
          ...positionStyles[position],
          zIndex,
          width: "400px",
          height: "600px",
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vh - 2rem)"
        },
        children: /* @__PURE__ */ jsx(HiveBot, {})
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: toggleOpen,
        className: "hivebot-toggle",
        style: {
          position: "fixed",
          ...positionStyles[position],
          zIndex: zIndex + 1,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(to bottom right, #6366f1, #9333ea)",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
          transition: "transform 0.2s, box-shadow 0.2s"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.2)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.2)";
        },
        "aria-label": isOpen ? "Close chat" : "Open chat",
        children: isOpen ? /* @__PURE__ */ jsx(X, { size: 24 }) : /* @__PURE__ */ jsx(MessageCircle, { size: 24 })
      }
    )
  ] });
}

export { BeeCharacter, ChatHeader, ChatInput, ChatMessages, ChatWidget, EmojiPopover, HiveBot, HiveBotProvider, MessageBubble, SourcesList, ThinkingDots, useHiveBot };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map