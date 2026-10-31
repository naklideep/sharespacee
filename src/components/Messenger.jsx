import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  Send,
  X,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import api from "../services/api";

// Backend URL: http://localhost:5000
const SOCKET_URL = api.defaults.baseURL.replace(/\/api\/?$/, "");

function getId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

function getUserId(user) {
  return getId(user?._id || user?.id || user?.userId);
}

function formatTime(date) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConversationDate(date) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

export default function Messenger({
  user,
  initialBookingId = null,
  onClose,
}) {
  const userId = getUserId(user);

  const [conversations, setConversations] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(
    initialBookingId ? String(initialBookingId) : ""
  );
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const bottomRef = useRef(null);
  const activeBookingRef = useRef(activeBookingId);

  // Keep the active booking ID current for Socket.IO callbacks.
  activeBookingRef.current = activeBookingId;

  const activeConversation = conversations.find(
    (conversation) =>
      getId(conversation.bookingId || conversation.booking) ===
      activeBookingId
  );

  // Add a message only to its correct conversation.
  const addMessage = useCallback(
    (message) => {
      if (!message?._id) return;

      const messageBookingId = getId(
        message.booking?._id ||
          message.bookingId ||
          message.booking
      );

      if (
        !messageBookingId ||
        messageBookingId !== activeBookingRef.current
      ) {
        return;
      }

      setMessages((current) => {
        const existing = current.findIndex(
          (item) => getId(item._id) === getId(message._id)
        );

        if (existing !== -1) {
          return current.map((item) =>
            getId(item._id) === getId(message._id)
              ? { ...item, ...message }
              : item
          );
        }

        return [...current, message].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      });
    },
    []
  );

  // Fetch all approved-booking conversations.
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await api.get("/chat/conversations");
      const data = response.data.data || [];

      setConversations(data);

      setActiveBookingId((current) => {
        const requested = initialBookingId
          ? String(initialBookingId)
          : current;

        const match = data.find(
          (item) =>
            getId(item.bookingId || item.booking) === requested
        );

        if (match) {
          return getId(match.bookingId || match.booking);
        }

        return data.length
          ? getId(data[0].bookingId || data[0].booking)
          : "";
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, [initialBookingId]);

  // Mark the selected conversation as read.
  const markConversationRead = useCallback(async (bookingId) => {
    if (!bookingId) return;

    try {
      await api.patch(`/chat/${bookingId}/read`);

      setConversations((current) =>
        current.map((conversation) =>
          getId(conversation.bookingId || conversation.booking) ===
          bookingId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      );
    } catch (err) {
      console.error("Unable to mark chat as read:", err);
    }
  }, []);

  // Fetch messages for one booking.
  const fetchMessages = useCallback(
    async (bookingId) => {
      if (!bookingId) return;

      try {
        setLoadingMessages(true);
        setError("");
        setMessages([]);

        const response = await api.get(
          `/chat/${bookingId}/messages`
        );

        // Avoid displaying messages if the user switched conversations
        // while the request was still running.
        if (activeBookingRef.current !== bookingId) return;

        setMessages(response.data.data || []);

        await markConversationRead(bookingId);
      } catch (err) {
        if (activeBookingRef.current === bookingId) {
          setError(
            err.response?.data?.message ||
              "Unable to load this conversation."
          );
        }
      } finally {
        if (activeBookingRef.current === bookingId) {
          setLoadingMessages(false);
        }
      }
    },
    [markConversationRead]
  );

  // Load conversations when Messenger opens.
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when the selected booking changes.
  useEffect(() => {
    if (activeBookingId) {
      fetchMessages(activeBookingId);
    } else {
      setMessages([]);
      setLoadingMessages(false);
    }
  }, [activeBookingId, fetchMessages]);

  // Authenticated Socket.IO connection.
  useEffect(() => {
    const token = localStorage.getItem("sharespace_token");

    if (!token || !userId) {
      setConnectionStatus("disconnected");
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      setConnectionStatus("disconnected");
    });

    // Receive real-time messages.
    socket.on("chat:message", (message) => {
      const bookingId = getId(
        message.booking?._id ||
          message.bookingId ||
          message.booking
      );

      if (!bookingId) return;

      const senderId = getId(message.sender?._id || message.sender);
      const isOwnMessage = senderId === userId;
      const isOpen =
        activeBookingRef.current === bookingId;

      // Update conversation preview and unread count.
      setConversations((current) => {
        const updated = current.map((conversation) => {
          if (
            getId(conversation.bookingId || conversation.booking) !==
            bookingId
          ) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessage: message,
            updatedAt: message.createdAt || new Date().toISOString(),
            unreadCount:
              isOwnMessage || isOpen
                ? 0
                : (conversation.unreadCount || 0) + 1,
          };
        });

        return updated.sort(
          (a, b) =>
            new Date(
              b.lastMessage?.createdAt || b.updatedAt || 0
            ).getTime() -
            new Date(
              a.lastMessage?.createdAt || a.updatedAt || 0
            ).getTime()
        );
      });

      // Add the message only if its conversation is currently open.
      if (isOpen) {
        addMessage(message);

        if (!isOwnMessage) {
          markConversationRead(bookingId);
        }
      }
    });

    // Receive read receipts.
    socket.on("chat:read", (receipt) => {
      if (
        getId(receipt.bookingId) !==
        activeBookingRef.current
      ) {
        return;
      }

      setMessages((current) =>
        current.map((message) => {
          const senderId = getId(
            message.sender?._id || message.sender
          );

          if (senderId === userId && !message.readAt) {
            return {
              ...message,
              readAt: receipt.readAt || new Date().toISOString(),
            };
          }

          return message;
        })
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [userId, addMessage, markConversationRead]);

  // Keep the latest message visible.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Select a conversation.
  const handleSelectConversation = (bookingId) => {
    setActiveBookingId(String(bookingId));
    setError("");
    setDraft("");
  };

  // Send a message.
  const handleSend = async (event) => {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !activeBookingId || sending) return;

    if (text.length > 2000) {
      setError("Messages cannot exceed 2,000 characters.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await api.post(
        `/chat/${activeBookingId}/messages`,
        { text }
      );

      const sentMessage = response.data.data;

      if (sentMessage) {
        addMessage(sentMessage);

        setConversations((current) =>
          current.map((conversation) =>
            getId(conversation.bookingId || conversation.booking) ===
            activeBookingId
              ? {
                  ...conversation,
                  lastMessage: sentMessage,
                  updatedAt:
                    sentMessage.createdAt ||
                    new Date().toISOString(),
                }
              : conversation
          )
        );
      }

      setDraft("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Message could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce(
    (total, item) =>
      total + Number(item.unreadCount || 0),
    0
  );

  return (
    <div
      className="messenger-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="messenger-window"
        role="dialog"
        aria-modal="true"
        aria-label="ShareSpace Messenger"
      >
        {/* Header */}
        <header className="messenger-header">
          <div className="messenger-brand">
            <span className="messenger-brand-icon">
              <MessageCircle size={20} />
            </span>

            <div>
              <h2>Correspondence.</h2>
              <p>ShareSpace private messages</p>
            </div>
          </div>

          <div className="messenger-header-right">
            <span className={`messenger-connection ${connectionStatus}`}>
              <span />

              {connectionStatus === "connected"
                ? "Live"
                : connectionStatus === "connecting"
                  ? "Connecting"
                  : "Offline"}
            </span>

            <button
              type="button"
              className="messenger-close"
              onClick={onClose}
              aria-label="Close messenger"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Main layout */}
        <div className="messenger-layout">

          {/* Conversation sidebar */}
          <aside
            className={`messenger-sidebar ${
              activeBookingId ? "has-active-chat" : ""
            }`}
          >
            <div className="messenger-sidebar-heading">
              <div>
                <span className="messenger-eyebrow">YOUR INBOX</span>
                <h3>Conversations</h3>
              </div>

              {totalUnread > 0 && (
                <span className="messenger-total-unread">
                  {totalUnread}
                </span>
              )}
            </div>

            {loadingConversations ? (
              <div className="messenger-empty">
                <RefreshCw
                  className="messenger-spin"
                  size={22}
                />
                <p>Opening your correspondence...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="messenger-empty">
                <MessageCircle size={27} />
                <p>No conversations yet.</p>
                <small>Approved bookings will appear here.</small>
              </div>
            ) : (
              <div className="messenger-conversation-list">
                {conversations.map((conversation) => {
                  const bookingId = getId(
                    conversation.bookingId || conversation.booking
                  );

                  const selected =
                    bookingId === activeBookingId;

                  return (
                    <button
                      type="button"
                      key={bookingId}
                      className={`messenger-conversation ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleSelectConversation(bookingId)
                      }
                    >
                      <span className="messenger-avatar">
                        {(conversation.otherUser?.name || "?")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <span className="messenger-conversation-copy">
                        <strong>
                          {conversation.otherUser?.name ||
                            "Community member"}
                        </strong>

                        <span className="messenger-resource-name">
                          <BookOpen size={12} />
                          {conversation.resource?.title ||
                            "Resource booking"}
                        </span>

                        <span className="messenger-preview">
                          {conversation.lastMessage?.text ||
                            "Start a conversation"}
                        </span>
                      </span>

                      <span className="messenger-conversation-meta">
                        <small>
                          {formatConversationDate(
                            conversation.lastMessage?.createdAt ||
                              conversation.updatedAt
                          )}
                        </small>

                        {conversation.unreadCount > 0 && (
                          <span className="messenger-unread">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              className="messenger-refresh"
              onClick={fetchConversations}
              disabled={loadingConversations}
            >
              <RefreshCw
                size={14}
                className={
                  loadingConversations ? "messenger-spin" : ""
                }
              />
              Refresh inbox
            </button>
          </aside>

          {/* Chat panel */}
          <main
            className={`messenger-chat ${
              activeBookingId ? "chat-active" : ""
            }`}
          >
            {activeConversation ? (
              <>
                <div className="messenger-chat-heading">
                  <button
                    type="button"
                    className="messenger-back"
                    onClick={() => setActiveBookingId("")}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <span className="messenger-avatar large">
                    {(activeConversation.otherUser?.name || "?")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div className="messenger-chat-person">
                    <strong>
                      {activeConversation.otherUser?.name ||
                        "Community member"}
                    </strong>

                    <span>
                      {activeConversation.resource?.title ||
                        "Approved booking"}
                    </span>
                  </div>
                </div>

                <div className="messenger-booking-context">
                  <BookOpen size={15} />

                  <span>
                    Booking:{" "}
                    {activeConversation.resource?.title || "Resource"}
                  </span>

                  <span className="messenger-approved">
                    Approved
                  </span>
                </div>

                <div className="messenger-messages">
                  {loadingMessages ? (
                    <div className="messenger-empty">
                      <RefreshCw
                        className="messenger-spin"
                        size={22}
                      />
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="messenger-empty">
                      <MessageCircle size={30} />
                      <p>Your conversation begins here.</p>
                      <small>
                        Send a message to get things moving.
                      </small>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const senderId = getId(
                        message.sender?._id || message.sender
                      );

                      const own = senderId === userId;

                      return (
                        <article
                          key={message._id}
                          className={`messenger-message ${
                            own ? "own" : "received"
                          }`}
                        >
                          <div className="messenger-message-bubble">
                            <p>{message.text}</p>

                            <div className="messenger-message-meta">
                              <time>
                                {formatTime(message.createdAt)}
                              </time>

                              {own && (
                                <span
                                  title={
                                    message.readAt ? "Read" : "Sent"
                                  }
                                  className={
                                    message.readAt ? "message-read" : ""
                                  }
                                >
                                  {message.readAt ? (
                                    <CheckCheck size={14} />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}

                  <div ref={bottomRef} />
                </div>

                {error && (
                  <p className="messenger-error" role="alert">
                    {error}
                  </p>
                )}

                <form
                  className="messenger-composer"
                  onSubmit={handleSend}
                >
                  <input
                    value={draft}
                    onChange={(event) =>
                      setDraft(event.target.value)
                    }
                    placeholder="Write a message..."
                    maxLength={2000}
                    aria-label="Message"
                  />

                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send message"
                  >
                    <Send size={17} />
                    <span>{sending ? "Sending" : "Send"}</span>
                  </button>
                </form>

                <p className="messenger-footnote">
                  Messages are private to the participants of this
                  approved booking.
                </p>
              </>
            ) : (
              <div className="messenger-welcome">
                <span className="messenger-welcome-icon">
                  <MessageCircle size={34} />
                </span>

                <span className="messenger-eyebrow">
                  SHARESPACE MESSENGER
                </span>

                <h3>
                  A good conversation
                  <br />
                  opens every door.
                </h3>

                <p>
                  Select a conversation to discuss pickup arrangements,
                  resource details, or anything related to your booking.
                </p>

                {error && (
                  <p className="messenger-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Messenger styling */}
      <style>{`
        .messenger-backdrop {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(15, 22, 34, .62);
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .messenger-window {
          width: min(1050px, 96vw);
          height: min(720px, 90vh);
          min-height: 430px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #1d2433;
          background: #fbfaf6;
          border: 1px solid #d9d4c4;
          border-radius: 9px;
          box-shadow: 0 24px 90px rgba(0, 0, 0, .28);
          font-family: var(--sans, Arial, sans-serif);
        }

        .messenger-header {
          height: 72px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 22px;
          background: #fff;
          border-bottom: 1px solid #d9d4c4;
        }

        .messenger-brand,
        .messenger-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .messenger-brand-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          color: #e9dcb8;
          background: #14213d;
          border-radius: 6px;
        }

        .messenger-brand h2 {
          margin: 0;
          color: #14213d;
          font: 600 23px var(--serif, Georgia, serif);
        }

        .messenger-brand p {
          margin: 3px 0 0;
          color: #777;
          font-size: 11px;
        }

        .messenger-connection {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #777;
          font-size: 11px;
        }

        .messenger-connection > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #aaa;
        }

        .messenger-connection.connected > span {
          background: #39865a;
        }

        .messenger-connection.disconnected > span {
          background: #b94c43;
        }

        .messenger-close,
        .messenger-back {
          display: grid;
          place-items: center;
          padding: 8px;
          color: #14213d;
          background: #fff;
          border: 1px solid #d9d4c4;
          border-radius: 5px;
          cursor: pointer;
        }

        .messenger-close:hover,
        .messenger-back:hover {
          background: #f1eee5;
        }

        .messenger-layout {
          display: grid;
          grid-template-columns: 330px minmax(0, 1fr);
          flex: 1;
          min-height: 0;
        }

        .messenger-sidebar {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          background: #f5f2e9;
          border-right: 1px solid #d9d4c4;
        }

        .messenger-sidebar-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 18px 16px;
        }

        .messenger-eyebrow {
          color: #92794c;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .15em;
        }

        .messenger-sidebar-heading h3 {
          margin: 5px 0 0;
          color: #14213d;
          font: 600 23px var(--serif, Georgia, serif);
        }

        .messenger-total-unread,
        .messenger-unread {
          display: grid;
          place-items: center;
          min-width: 21px;
          height: 21px;
          padding: 0 6px;
          color: #fff;
          background: #7a1f2b;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .messenger-conversation-list {
          flex: 1;
          overflow-y: auto;
        }

        .messenger-conversation {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          text-align: left;
          color: inherit;
          background: transparent;
          border: 0;
          border-top: 1px solid #e5dfd1;
          cursor: pointer;
        }

        .messenger-conversation:hover,
        .messenger-conversation.selected {
          background: #eae5d8;
        }

        .messenger-avatar {
          width: 39px;
          height: 39px;
          flex: none;
          display: grid;
          place-items: center;
          color: #fff;
          background: #14213d;
          border-radius: 50%;
          font: 18px var(--serif, Georgia, serif);
        }

        .messenger-avatar.large {
          width: 42px;
          height: 42px;
          font-size: 20px;
        }

        .messenger-conversation-copy {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .messenger-conversation-copy strong {
          color: #1d2433;
          font-size: 12px;
        }

        .messenger-resource-name {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #92794c;
          font-size: 10px;
        }

        .messenger-preview {
          overflow: hidden;
          color: #777;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .messenger-conversation-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
          align-self: stretch;
          justify-content: space-between;
        }

        .messenger-conversation-meta small {
          color: #888;
          font-size: 9px;
        }

        .messenger-refresh {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 13px;
          color: #526078;
          background: #fff;
          border: 0;
          border-top: 1px solid #ded7c8;
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .messenger-refresh:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .messenger-chat {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          background: #fff;
        }

        .messenger-chat-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 70px;
          padding: 12px 20px;
          border-bottom: 1px solid #e5e0d5;
        }

        .messenger-chat-person {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .messenger-chat-person strong {
          color: #14213d;
          font: 600 19px var(--serif, Georgia, serif);
        }

        .messenger-chat-person span {
          color: #888;
          font-size: 11px;
        }

        .messenger-back {
          display: none;
        }

        .messenger-booking-context {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          color: #6e654f;
          background: #f8f5ed;
          border-bottom: 1px solid #eee6d7;
          font-size: 11px;
        }

        .messenger-approved {
          margin-left: auto;
          padding: 4px 8px;
          color: #356647;
          background: #e9f2e8;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .messenger-messages {
          flex: 1;
          overflow-y: auto;
          padding: 22px;
          background: linear-gradient(#fff, #fbfaf6);
        }

        .messenger-message {
          display: flex;
          margin: 9px 0;
        }

        .messenger-message.own {
          justify-content: flex-end;
        }

        .messenger-message.received {
          justify-content: flex-start;
        }

        .messenger-message-bubble {
          max-width: min(75%, 560px);
          padding: 11px 14px;
          background: #f0eee8;
          border: 1px solid #e4dfd3;
          border-radius: 9px 9px 9px 2px;
        }

        .messenger-message.own .messenger-message-bubble {
          color: #fff;
          background: #14213d;
          border-color: #14213d;
          border-radius: 9px 9px 2px 9px;
        }

        .messenger-message-bubble p {
          margin: 0;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
          font-size: 13px;
          line-height: 1.55;
        }

        .messenger-message-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
          margin-top: 6px;
          opacity: .7;
          font-size: 9px;
        }

        .messenger-message-meta span {
          display: flex;
        }

        .messenger-message-meta .message-read {
          color: #8fd1ff;
          opacity: 1;
        }

        .messenger-composer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 17px;
          background: #fff;
          border-top: 1px solid #e5e0d5;
        }

        .messenger-composer input {
          flex: 1;
          min-width: 0;
          padding: 12px 14px;
          color: #1d2433;
          background: #fbfaf6;
          border: 1px solid #d9d4c4;
          border-radius: 5px;
          outline-color: #b08d3c;
          font: inherit;
          font-size: 13px;
        }

        .messenger-composer button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px 16px;
          color: #fff;
          background: #14213d;
          border: 0;
          border-radius: 5px;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
        }

        .messenger-composer button:hover {
          background: #1d2f55;
        }

        .messenger-composer button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .messenger-footnote {
          margin: 0;
          padding: 0 17px 10px;
          color: #999;
          background: #fff;
          font-size: 9px;
          text-align: center;
        }

        .messenger-empty,
        .messenger-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 30px 20px;
          color: #888;
          text-align: center;
          font-size: 12px;
          line-height: 1.6;
        }

        .messenger-empty {
          flex: 1;
        }

        .messenger-empty p {
          margin: 0;
        }

        .messenger-empty small {
          color: #999;
        }

        .messenger-welcome {
          flex: 1;
          padding: 35px;
        }

        .messenger-welcome-icon {
          display: grid;
          width: 65px;
          height: 65px;
          place-items: center;
          margin-bottom: 8px;
          color: #e9dcb8;
          background: #14213d;
          border-radius: 50%;
        }

        .messenger-welcome h3 {
          margin: 3px 0;
          color: #14213d;
          font: 600 31px/1.15 var(--serif, Georgia, serif);
        }

        .messenger-welcome p {
          max-width: 340px;
          margin: 0;
        }

        .messenger-error {
          margin: 0;
          padding: 10px 14px;
          color: #8c3028;
          background: #f9e5e2;
          font-size: 12px;
        }

        .messenger-spin {
          animation: messenger-rotate 1s linear infinite;
        }

        @keyframes messenger-rotate {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 680px) {
          .messenger-backdrop {
            padding: 0;
          }

          .messenger-window {
            width: 100vw;
            height: 100dvh;
            min-height: 0;
            border: 0;
            border-radius: 0;
          }

          .messenger-layout {
            grid-template-columns: 1fr;
          }

          .messenger-sidebar.has-active-chat {
            display: none;
          }

          .messenger-chat:not(.chat-active) {
            display: none;
          }

          .messenger-back {
            display: grid;
          }

          .messenger-messages {
            padding: 15px;
          }

          .messenger-message-bubble {
            max-width: 88%;
          }

          .messenger-welcome {
            padding: 25px;
          }

          .messenger-welcome h3 {
            font-size: 27px;
          }
        }

        @media (max-width: 420px) {
          .messenger-header {
            padding: 0 13px;
          }

          .messenger-connection {
            font-size: 10px;
          }

          .messenger-composer {
            padding: 10px;
          }

          .messenger-composer button {
            padding: 12px;
          }

          .messenger-composer button span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}