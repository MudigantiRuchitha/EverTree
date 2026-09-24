"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { chatAPI } from "../../services/api";

export default function MessagesPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { socket } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    // Keep MediaRecorder available between button clicks
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const mediaStreamRef = useRef(null);

    useEffect(() => {
        if (loading) return;

        if (!user || user.role !== "admin") {
            router.replace("/evertree/secure/login");
            return;
        }

        const fetchConversations = async () => {
            try {
                setPageLoading(true);
                setError("");

                const response = await chatAPI.getAdminConversations();

                const data = Array.isArray(response.data)
                    ? response.data
                    : [];

                const formattedConversations = data.map((conversation) => {
                    const isSender =
                        Number(conversation.sender_id) === Number(user.id);

                    return {
                        ...conversation,

                        partner_id: isSender
                            ? conversation.receiver_id
                            : conversation.sender_id,

                        partner_name: isSender
                            ? conversation.receiver_name
                            : conversation.sender_name,

                        partner_role: "user",
                    };
                });

                setConversations(formattedConversations);
            } catch (err) {
                console.error("Failed to load conversations:", err);

                setError(
                    err?.response?.data?.error ||
                        "Unable to load conversations."
                );
            } finally {
                setPageLoading(false);
            }
        };

        fetchConversations();
    }, [user, loading, router]);

    const openConversation = async (conversation) => {
        try {
            setSelectedPartner(conversation);
            setMessageLoading(true);
            setError("");
            setInputMessage("");

            const response = await chatAPI.getMessages(
                conversation.partner_id
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setMessages(data);
        } catch (err) {
            console.error("Failed to load messages:", err);

            setError(
                err?.response?.data?.error ||
                    "Unable to load messages."
            );

            setMessages([]);
        } finally {
            setMessageLoading(false);
        }
    };

    const handleChatFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !selectedPartner || !user) {
        return;
    }

    try {
        console.log("Selected chat file:", file);

        // Upload file
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse =
            await chatAPI.uploadChatFile(formData);

        console.log(
            "Chat file uploaded:",
            uploadResponse.data
        );

        const { file_url, media_type } =
            uploadResponse.data;

        // Send uploaded file as a chat message
        const messageResponse =
            await chatAPI.sendMessage({
                receiver_id:
                    selectedPartner.partner_id,

                message:
                    media_type === "image"
                        ? "📷 Image"
                        : "📎 Attachment",

                media_url: file_url,

                media_type: media_type,
            });

        // Show message immediately
        setMessages((prev) => [
            ...prev,
            messageResponse.data,
        ]);

        console.log(
            "File message sent:",
            messageResponse.data
        );

    } catch (error) {
        console.error(
            "Chat file error:",
            error
        );

        alert("Failed to send file.");

    } finally {
        // Allows selecting the same file again
        event.target.value = "";
    }
};

    // We will add upload + send logic in the next step.


    // Start / Stop Voice Recording
    const handleSendVoiceNote = async () => {
        if (!selectedPartner || !user) return;

        // If already recording → STOP
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
        ) {
            mediaRecorderRef.current.stop();
            return;
        }

        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

            mediaStreamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                try {
                    setIsRecordingVoice(false);

                    stream
                        .getTracks()
                        .forEach((track) => track.stop());

                    const audioBlob = new Blob(
                        audioChunksRef.current,
                        {
                            type: "audio/webm",
                        }
                    );

                    console.log("Voice recorded:", audioBlob);

                    const formData = new FormData();

                    formData.append(
                        "file",
                        audioBlob,
                        `voice-${Date.now()}.webm`
                    );

                    // Upload voice file
                    const uploadResponse =
                        await chatAPI.uploadChatFile(formData);

                    const {
                        file_url,
                        media_type,
                    } = uploadResponse.data;

                    console.log(
                        "Voice uploaded:",
                        uploadResponse.data
                    );

                    // Save message
                    const messageResponse =
                        await chatAPI.sendMessage({
                            receiver_id:
                                selectedPartner.partner_id,

                            message: "🎙️ Voice Message",

                            media_url: file_url,

                            media_type: media_type,
                        });

                    // Show immediately
                    setMessages((prev) => [
                        ...prev,
                        messageResponse.data,
                    ]);

                    console.log(
                        "Voice message sent:",
                        messageResponse.data
                    );

                    mediaRecorderRef.current = null;
                    mediaStreamRef.current = null;
                    audioChunksRef.current = [];
                } catch (error) {
                    console.error(
                        "Voice upload error:",
                        error
                    );

                    setIsRecordingVoice(false);

                    alert(
                        "Failed to send voice message."
                    );
                }
            };

            mediaRecorder.start();

            setIsRecordingVoice(true);

            console.log("Voice recording started");
        } catch (error) {
            console.error(
                "Microphone error:",
                error
            );

            setIsRecordingVoice(false);

            alert(
                "Microphone permission is required to record a voice message."
            );
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (
            !inputMessage.trim() ||
            !selectedPartner ||
            !user
        ) {
            return;
        }

        try {
            setSendingMessage(true);
            setError("");

            const response =
                await chatAPI.sendMessage({
                    receiver_id:
                        selectedPartner.partner_id,

                    message: inputMessage.trim(),
                });

            setMessages((prev) => [
                ...prev,
                response.data,
            ]);

            setInputMessage("");
        } catch (err) {
            console.error(
                "Failed to send message:",
                err
            );

            setError(
                err?.response?.data?.error ||
                    "Unable to send message."
            );
        } finally {
            setSendingMessage(false);
        }
    };

    if (pageLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950">
                <p className="text-white">
                    Loading Messages...
                </p>
            </main>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-950 p-6 sm:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                        Communication
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-white">
                        Messages
                    </h1>

                    <p className="mt-2 text-slate-400">
                        View conversations between EverTree users.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-red-400">
                        {error}
                    </div>
                )}

                {/* Messages Layout */}
                <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:grid-cols-3">

                    {/* Conversations */}
                    <div className="border-b border-slate-800 lg:border-b-0 lg:border-r">

                        <div className="border-b border-slate-800 px-5 py-4">
                            <h2 className="font-semibold text-white">
                                Conversations
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {conversations.length} conversation
                                {conversations.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="max-h-[520px] overflow-y-auto">

                            {conversations.length > 0 ? (
                                conversations.map(
                                    (conversation) => (
                                        <button
                                            key={
                                                conversation.partner_id
                                            }
                                            onClick={() =>
                                                openConversation(
                                                    conversation
                                                )
                                            }
                                            className={`w-full border-b border-slate-800 px-5 py-4 text-left transition hover:bg-slate-800 ${
                                                selectedPartner?.partner_id ===
                                                conversation.partner_id
                                                    ? "bg-slate-800"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-emerald-400">
                                                    {conversation.partner_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                        "U"}
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-center justify-between gap-2">

                                                        <p className="truncate font-semibold text-white">
                                                            {conversation.partner_name ||
                                                                "Unknown User"}
                                                        </p>

                                                        <span className="text-xs text-slate-500">
                                                            {conversation.created_at
                                                                ? new Date(
                                                                      conversation.created_at
                                                                  ).toLocaleDateString()
                                                                : ""}
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 text-xs capitalize text-emerald-400">
                                                        {conversation.partner_role ||
                                                            "user"}
                                                    </p>

                                                    <p className="mt-1 truncate text-sm text-slate-400">
                                                        {conversation.last_message ||
                                                            "No message"}
                                                    </p>

                                                </div>
                                            </div>
                                        </button>
                                    )
                                )
                            ) : (
                                <div className="px-5 py-16 text-center">

                                    <p className="text-lg font-semibold text-slate-300">
                                        No conversations
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        No user conversations are available.
                                    </p>

                                </div>
                            )}

                        </div>
                    </div>

                    {/* Chat */}
                    <div className="flex min-h-[600px] flex-col lg:col-span-2">

                        {selectedPartner ? (
                            <>

                                {/* Chat Header */}
                                <div className="border-b border-slate-800 px-6 py-4">

                                    <p className="font-semibold text-white">
                                        {selectedPartner.partner_name ||
                                            "Unknown User"}
                                    </p>

                                    <p className="mt-1 text-xs capitalize text-slate-500">
                                        {selectedPartner.partner_role ||
                                            "user"}
                                    </p>

                                </div>

                                {/* Messages */}
                                <div className="flex-1 space-y-4 overflow-y-auto p-6">

                                    {messageLoading ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-slate-400">
                                                Loading conversation...
                                            </p>
                                        </div>
                                    ) : messages.length > 0 ? (
                                        messages.map(
                                            (message) => {

                                                const isSender =
                                                    Number(
                                                        message.sender_id
                                                    ) ===
                                                    Number(
                                                        user.id
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            message.id
                                                        }
                                                        className={`flex ${
                                                            isSender
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                                                isSender
                                                                    ? "bg-emerald-600 text-white"
                                                                    : "bg-slate-800 text-slate-200"
                                                            }`}
                                                        >

                                                            <p className="text-xs font-semibold opacity-70">
                                                                {isSender
                                                                    ? "You"
                                                                    : message.sender_name ||
                                                                      "User"}
                                                            </p>

{/* Voice / Image / PDF / Attachment Message */}

{message.media_type === "voice" && message.media_url ? (
    <div className="mt-2">
        <audio
            controls
            preload="metadata"
            className="w-full max-w-[280px]"
            src={`http://localhost:5000${message.media_url}`}
        />
    </div>
) : message.media_type === "image" && message.media_url ? (
    <div className="mt-2">
        <img
            src={`http://localhost:5000${message.media_url}`}
            alt="Image attachment"
            onClick={() =>
                setSelectedImage(
                    `http://localhost:5000${message.media_url}`
                )
            }
            className="max-w-[280px] cursor-pointer rounded-xl transition hover:opacity-90"
        />
    </div>
) : message.media_url ? (
    <a
        href={`http://localhost:5000${message.media_url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex max-w-[280px] items-center gap-3 rounded-xl bg-slate-800 p-3 text-sm text-white transition hover:bg-slate-700"
    >
        <span className="text-2xl">
            {message.media_url.toLowerCase().endsWith(".pdf")
                ? "📄"
                : "📎"}
        </span>

        <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
                {decodeURIComponent(
                    message.media_url.split("/").pop() ||
                        "Attachment"
                )}
            </span>

            <span className="text-xs text-slate-400">
                Click to open
            </span>
        </span>
    </a>
) : (
    <p className="mt-1 whitespace-pre-wrap text-sm">
        {message.message || "📎 Attachment"}
    </p>
)}   


                                                            {message.created_at && (
                                                                <p className="mt-2 text-[10px] opacity-60">
                                                                    {new Date(
                                                                        message.created_at
                                                                    ).toLocaleString()}
                                                                </p>
                                                            )}

                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-slate-500">
                                                No messages in this conversation.
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {/* Send Message */}
    <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-800 p-4"
    >
        <div className="flex gap-3">

            <button
                type="button"
                onClick={handleSendVoiceNote}
                className={`rounded-xl p-3 transition ${
                isRecordingVoice
                    ? "animate-pulse bg-red-100 text-red-600"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Voice Note"
        >
            <Mic className="h-5 w-5" />
        </button>

        <input
            type="file"
            id="chatFileInput"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleChatFileChange}
        />

        <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${
                selectedPartner.partner_name || "user"
            }...`}
            disabled={sendingMessage}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
        />

        <button
            type="button"
            onClick={() =>
                document.getElementById("chatFileInput")?.click()
            }
            className="rounded-xl p-3 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            title="Attach file"
        >
    📎
        </button>

        <button
            type="submit"
            disabled={
                sendingMessage || !inputMessage.trim()
            }
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {sendingMessage ? "Sending..." : "Send"}
        </button>

         </div>
        </form>

        </>
        ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-300">
                            Select a conversation
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Choose a conversation from the left to view its messages.
                        </p>
                    </div>
                </div>
                )}

        </div>

     </div>
    </div>
    {selectedImage && (
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6"
        onClick={() => setSelectedImage(null)}
    >
        <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-6 top-6 z-10 rounded-full bg-white/10 px-4 py-2 text-2xl text-white hover:bg-white/20"
        >
            ✕
        </button>

        <img
            src={selectedImage}
            alt="Full size attachment"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
        />
    </div>
)}
   </main>
  );
}