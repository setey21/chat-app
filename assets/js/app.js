"use strict";

const STORAGE_KEY = "gather-chat-state-v1";
const MAX_MESSAGE_LENGTH = 4000;

const contacts = [
  { id: "maya", name: "Maya Chen", colors: ["#f8ded2", "#9d6653"] },
  { id: "leo", name: "Leo Martinez", colors: ["#d9e9ff", "#50739f"] },
  { id: "amara", name: "Amara Okafor", colors: ["#f4e3bf", "#95733c"] },
  { id: "noah", name: "Noah Williams", colors: ["#d9eee6", "#4d826d"] },
  { id: "sophie", name: "Sophie Laurent", colors: ["#f1dff0", "#946b8c"] },
  { id: "ethan", name: "Ethan Park", colors: ["#dce2f7", "#5f6eaa"] },
];

const $ = (selector) => document.querySelector(selector);
const chatLayout = $(".chat-layout");
const contactList = $("#contact-list");
const contactCount = $("#contact-count");
const contactSearch = $("#contact-search");
const listCaption = $("#list-caption");
const conversationEmpty = $("#conversation-empty");
const conversationContent = $("#conversation-content");
const activeContact = $("#active-contact");
const messageArea = $("#message-area");
const messageList = $("#message-list");
const messagesEmpty = $("#messages-empty");
const messageForm = $("#message-form");
const messageInput = $("#message-input");
const sendButton = $("#send-button");
const clearButton = $("#clear-button");
const backButton = $("#back-button");
const appStatus = $("#app-status");

function makeTimestamp(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function makeMessage(id, from, text, minutesAgo) {
  return { id, from, text, timestamp: makeTimestamp(minutesAgo) };
}

function makeInitialState() {
  return {
    selectedContactId: null,
    conversations: {
      maya: {
        unread: 2,
        messages: [
          makeMessage("maya-1", "contact", "Hey! I found that little bookstore you were telling me about.", 1460),
          makeMessage("maya-2", "me", "The one tucked behind the coffee shop? I love that place.", 1432),
          makeMessage("maya-3", "contact", "That's the one! They have a tiny reading garden in the back 🌿", 18),
          makeMessage("maya-4", "contact", "We should go this weekend if you're free.", 12),
        ],
      },
      leo: {
        unread: 0,
        messages: [
          makeMessage("leo-1", "me", "How did the trail turn out yesterday?", 1980),
          makeMessage("leo-2", "contact", "Incredible views, and we just beat the rain. Sending you the route!", 1952),
        ],
      },
      amara: {
        unread: 1,
        messages: [
          makeMessage("amara-1", "me", "I tried your ginger tea recipe this morning.", 670),
          makeMessage("amara-2", "contact", "Oh nice! A little honey makes it even better ☕", 645),
        ],
      },
      noah: {
        unread: 0,
        messages: [
          makeMessage("noah-1", "contact", "Are we still on for the gallery on Thursday?", 2930),
          makeMessage("noah-2", "me", "Absolutely. I bookmarked the new photography exhibit.", 2900),
        ],
      },
      sophie: {
        unread: 0,
        messages: [
          makeMessage("sophie-1", "me", "Your playlist has been on repeat all week.", 4600),
          makeMessage("sophie-2", "contact", "That makes me happy! I'll send you the next one soon.", 4565),
        ],
      },
      ethan: {
        unread: 0,
        messages: [
          makeMessage("ethan-1", "contact", "I saved you a seat for the talk tomorrow.", 8760),
          makeMessage("ethan-2", "me", "Thanks! Looking forward to it.", 8720),
        ],
      },
    },
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidMessage(message) {
  return isRecord(message)
    && typeof message.id === "string"
    && message.id.length > 0
    && (message.from === "me" || message.from === "contact")
    && typeof message.text === "string"
    && message.text.trim().length > 0
    && message.text.length <= MAX_MESSAGE_LENGTH
    && typeof message.timestamp === "string"
    && !Number.isNaN(Date.parse(message.timestamp));
}

function readSavedState() {
  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    setStatus("Saved chats could not be accessed. This session will not be saved.");
    return null;
  }

  if (raw === null) return null;

  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    setStatus("Saved chat data was invalid, so the demo conversations were restored.");
    return null;
  }

  if (!isRecord(saved) || saved.version !== 1 || !isRecord(saved.conversations)) {
    setStatus("Saved chat data was invalid, so the demo conversations were restored.");
    return null;
  }

  const validIds = new Set(contacts.map((contact) => contact.id));
  const conversations = {};
  for (const contact of contacts) {
    const stored = saved.conversations[contact.id];
    if (!isRecord(stored) || !Array.isArray(stored.messages)
      || !Number.isInteger(stored.unread) || stored.unread < 0
      || !stored.messages.every(isValidMessage)) {
      setStatus("Saved chat data was incomplete, so the demo conversations were restored.");
      return null;
    }

    conversations[contact.id] = {
      unread: stored.unread,
      messages: stored.messages.map((message) => ({
        id: message.id,
        from: message.from,
        text: message.text,
        timestamp: message.timestamp,
      })),
    };
  }

  const selectedContactId = validIds.has(saved.selectedContactId) ? saved.selectedContactId : null;
  return { selectedContactId, conversations };
}

function saveState() {
  const data = {
    version: 1,
    selectedContactId: state.selectedContactId,
    conversations: state.conversations,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    setStatus("Your latest changes could not be saved. Check your browser's storage settings.");
    return false;
  }
}

function setStatus(message) {
  appStatus.textContent = message;
}

const state = readSavedState() || makeInitialState();

function getContact(contactId) {
  return contacts.find((contact) => contact.id === contactId);
}

function getConversation(contactId) {
  return state.conversations[contactId];
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function createAvatar(contact, className) {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.textContent = getInitials(contact.name);
  avatar.setAttribute("aria-hidden", "true");
  avatar.style.backgroundColor = contact.colors[0];
  avatar.style.color = contact.colors[1];
  return avatar;
}

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function getPreview(conversation) {
  const latest = conversation.messages[conversation.messages.length - 1];
  if (!latest) return "No messages yet";
  return latest.from === "me" ? `You: ${latest.text}` : latest.text;
}

function getLastTimestamp(conversation) {
  const latest = conversation.messages[conversation.messages.length - 1];
  return latest ? formatTimestamp(latest.timestamp) : "";
}

function createContactRow(contact) {
  const conversation = getConversation(contact.id);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "contact-row";
  button.dataset.contactId = contact.id;
  button.setAttribute("aria-pressed", String(state.selectedContactId === contact.id));
  if (state.selectedContactId === contact.id) button.classList.add("is-active");
  button.append(createAvatar(contact, "contact-avatar"));

  const copy = document.createElement("span");
  copy.className = "contact-copy";
  const top = document.createElement("span");
  top.className = "contact-topline";
  const name = document.createElement("span");
  name.className = "contact-name";
  name.textContent = contact.name;
  const time = document.createElement("span");
  time.className = "contact-time";
  time.textContent = getLastTimestamp(conversation);
  top.append(name, time);

  const bottom = document.createElement("span");
  bottom.className = "contact-bottomline";
  const preview = document.createElement("span");
  preview.className = "contact-preview";
  preview.textContent = getPreview(conversation);
  bottom.append(preview);
  if (conversation.unread > 0 && state.selectedContactId !== contact.id) {
    const badge = document.createElement("span");
    badge.className = "unread-badge";
    badge.textContent = conversation.unread > 99 ? "99+" : String(conversation.unread);
    badge.setAttribute("aria-label", `${conversation.unread} unread messages`);
    bottom.append(badge);
  }

  copy.append(top, bottom);
  button.append(copy);
  button.addEventListener("click", () => selectContact(contact.id));
  return button;
}

function renderContacts() {
  const query = contactSearch.value.trim().toLocaleLowerCase();
  const filtered = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(query));
  contactList.replaceChildren();
  contactCount.textContent = String(contacts.length);
  listCaption.textContent = query ? `${filtered.length} found` : "All conversations";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "contact-list-empty";
    const message = document.createElement("p");
    message.textContent = "No contacts found. Try another name.";
    const clearSearch = document.createElement("button");
    clearSearch.type = "button";
    clearSearch.textContent = "Clear search";
    clearSearch.addEventListener("click", () => {
      contactSearch.value = "";
      renderContacts();
      contactSearch.focus();
    });
    empty.append(message, clearSearch);
    contactList.append(empty);
    return;
  }

  for (const contact of filtered) contactList.append(createContactRow(contact));
}

function renderActiveContact() {
  const contact = getContact(state.selectedContactId);
  const hasSelection = Boolean(contact);
  conversationEmpty.hidden = hasSelection;
  conversationContent.hidden = !hasSelection;
  chatLayout.classList.toggle("is-chat-open", hasSelection);
  if (!contact) return;

  activeContact.replaceChildren();
  activeContact.append(createAvatar(contact, "contact-avatar"));
  const copy = document.createElement("div");
  copy.className = "active-contact-copy";
  const name = document.createElement("p");
  name.className = "active-contact-name";
  name.textContent = contact.name;
  const meta = document.createElement("p");
  meta.className = "active-contact-meta";
  meta.textContent = "Conversation saved on this device";
  copy.append(name, meta);
  activeContact.append(copy);
}

function createMessage(message, contact) {
  const isSent = message.from === "me";
  const row = document.createElement("article");
  row.className = `message-row ${isSent ? "is-sent" : "is-received"}`;

  if (!isSent) row.append(createAvatar(contact, "message-avatar"));
  const content = document.createElement("div");
  content.className = "message-content";
  if (!isSent) {
    const author = document.createElement("p");
    author.className = "message-author";
    author.textContent = contact.name;
    content.append(author);
  }
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = message.text;
  const timestamp = document.createElement("time");
  timestamp.className = "message-time";
  timestamp.dateTime = message.timestamp;
  timestamp.textContent = formatTimestamp(message.timestamp);
  content.append(bubble, timestamp);
  row.append(content);
  return row;
}

function renderMessages() {
  const contact = getContact(state.selectedContactId);
  if (!contact) return;
  const conversation = getConversation(contact.id);
  messageList.replaceChildren();
  for (const message of conversation.messages) {
    messageList.append(createMessage(message, contact));
  }
  const hasMessages = conversation.messages.length > 0;
  messageList.hidden = !hasMessages;
  messagesEmpty.hidden = hasMessages;
  clearButton.disabled = !hasMessages;
  messageArea.scrollTop = messageArea.scrollHeight;
}

function render() {
  renderContacts();
  renderActiveContact();
  renderMessages();
}

function selectContact(contactId) {
  if (!getContact(contactId)) return;
  state.selectedContactId = contactId;
  getConversation(contactId).unread = 0;
  render();
  saveState();
  messageInput.focus({ preventScroll: true });
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !state.selectedContactId) return;

  getConversation(state.selectedContactId).messages.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    from: "me",
    text: text.slice(0, MAX_MESSAGE_LENGTH),
    timestamp: new Date().toISOString(),
  });
  messageInput.value = "";
  updateSendButton();
  render();
  saveState();
  messageInput.focus();
}

function updateSendButton() {
  sendButton.disabled = messageInput.value.trim().length === 0;
}

contactSearch.addEventListener("input", renderContacts);

messageInput.addEventListener("input", updateSendButton);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (!sendButton.disabled) sendMessage();
  }
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

clearButton.addEventListener("click", () => {
  const contact = getContact(state.selectedContactId);
  if (!contact || getConversation(contact.id).messages.length === 0) return;
  const confirmed = window.confirm(`Clear the conversation with ${contact.name}? This cannot be undone.`);
  if (!confirmed) return;
  getConversation(contact.id).messages = [];
  getConversation(contact.id).unread = 0;
  render();
  saveState();
});

backButton.addEventListener("click", () => {
  chatLayout.classList.remove("is-chat-open");
  contactList.querySelector(`[data-contact-id="${state.selectedContactId}"]`)?.focus();
});

render();
