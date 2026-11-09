# Gather Chat

A beginner-friendly messaging UI built with HTML5, CSS3, and vanilla JavaScript. It runs entirely in your browser and stores demo conversations in LocalStorage.

## Run with VS Code Live Server

1. Open this project folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html`, then select **Go Live** in the VS Code status bar (or right-click the file and choose **Open with Live Server**).
4. Your browser will open the app. No build, package installation, or server-side code is needed.

You can also open `index.html` directly in a modern browser.

## Features

- Six seeded contacts with initials, latest-message previews, and unread badges.
- Search contacts by name and select a chat to read it.
- Send a message using the button or Enter; use Shift+Enter for a line break.
- Clear the current chat after confirming the action.
- Responsive desktop two-panel layout and mobile contacts/chat navigation.
- Accessible labels, keyboard focus styles, message timestamps, and empty states.
- Conversations and the selected contact are saved in LocalStorage and restored after a reload.
- Message content is rendered as text, not HTML.

## Limitations

- This is a front-end demo. Messages are stored only in the current browser on the current device.
- There is no account, backend, cross-device sync, online status, or real-time delivery.
- Demo contacts and received messages are sample content; sending a message does not contact another person.
- Clearing a chat cannot be undone. Clearing browser site data removes the saved conversations.
- The app uses system font stacks and does not require network access.

## Test checklist

- [ ] Open the page at desktop width and confirm contacts and the empty conversation state are visible.
- [ ] Select a contact; confirm its chat opens and its unread badge is cleared.
- [ ] Search by full or partial contact name, then clear the search.
- [ ] Send a non-empty message with the button and with Enter; verify the timestamp and contact preview update.
- [ ] Try sending whitespace only; confirm it is rejected. Use Shift+Enter to create a line break.
- [ ] Reload the page and confirm the sent message and selected chat are restored.
- [ ] Clear a populated chat and test both canceling and confirming the confirmation prompt.
- [ ] Clear a chat, then confirm the no-messages state and disabled Clear chat button.
- [ ] Search for a name with no matches and use the Clear search control.
- [ ] At mobile width, confirm contacts are shown first, selecting one opens the chat, and Chats returns to the list.
- [ ] Use Tab and keyboard activation to check focus visibility and button access.
- [ ] In browser developer tools, corrupt the `gather-chat-state-v1` LocalStorage value and reload; confirm the app recovers without crashing.
