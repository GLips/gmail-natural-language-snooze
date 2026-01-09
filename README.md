# Gmail Snooze Natural-Language Input

A Chrome extension that enhances Gmail's snooze feature with a keyboard-first, natural language input field. Instead of clicking through Gmail's date picker, simply type "tomorrow 9am" or "next Monday" and press Enter.

## Features

- **Natural Language Input**: Type human-readable expressions like "tomorrow 9am", "next Monday", "in 3 hours"
- **Real-Time Preview**: See the parsed date/time as you type
- **Smart UI Injection**: Automatically appears when you open Gmail's snooze menu
- **Locale-Aware**: Adapts to your Gmail date/time format settings
- **Keyboard-First**: Press Enter to confirm, Escape to cancel
- **Success Notifications**: Toast confirmation with scheduled date/time
- **Non-Intrusive**: Works alongside Gmail's native functionality without breaking it

## Supported Natural Language Examples

- **Relative times**: "in 3 hours", "in 2 days", "in 30 minutes"
- **Named days**: "tomorrow", "next Monday", "this Friday"
- **Time of day**: "tomorrow 9am", "next Tuesday 2:30pm"
- **Casual expressions**: "this afternoon", "tonight", "next week"
- **Specific dates**: "Jan 10", "January 15th 2026"
- **Combined**: "next Monday at 8:30am", "tomorrow morning"

## Installation

### Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and toolkit
- Google Chrome or any Chromium-based browser

### Build the Extension

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd gmail-chrome-extension
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Build the extension:
   ```bash
   bun run build
   ```

   This creates a `dist/` directory with the bundled extension files.

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable "Developer mode" using the toggle in the top-right corner

3. Click "Load unpacked"

4. Select the `dist/` directory from this project

5. The extension is now installed! You should see "Gmail Snooze Natural-Language Input" in your extensions list.

### Verify Installation

1. Go to [Gmail](https://mail.google.com/)
2. Open any email
3. Click the snooze icon (clock icon in the toolbar)
4. You should see a natural language input field appear above the snooze menu
5. Type "tomorrow 9am" and press Enter

## Usage

1. **Open Gmail** and select an email
2. **Click the snooze icon** (or press 'b' if you use keyboard shortcuts)
3. **Type a natural language time** in the input field that appears
   - Example: "tomorrow 9am"
   - You'll see a preview of the parsed date below
4. **Press Enter** to snooze the email
5. **See a confirmation toast** with the scheduled date/time

### Tips

- The extension validates that dates are in the future
- If the input can't be parsed, you'll see an error message
- Press Escape to dismiss the input and use Gmail's native picker instead
- The extension adapts to your Gmail locale settings automatically

## Tech Stack

- **TypeScript** - Type-safe development
- **Bun** - Fast build and runtime
- **chrono-node** - Natural language date parsing
- **date-fns** - Date formatting
- **Chrome Extension Manifest V3** - Modern extension API

## Development

### Type Checking
```bash
bun run typecheck
```

### Linting
```bash
bun run lint
```

### Testing
```bash
bun test
```

### Rebuild After Changes
```bash
bun run build
```

After rebuilding, go to `chrome://extensions/` and click the refresh icon on the extension card to reload it.

## Architecture

```
src/content/
├── content-script.ts      # Entry point
├── dom-observer.ts        # Watches for snooze menu
├── ui-injector.ts         # Creates natural language input UI
├── date-parser.ts         # Parses natural language to Date
├── snooze-actions.ts      # Interacts with Gmail's snooze menu
├── modal-handler.ts       # Fills date/time in Gmail's modal
└── toast.ts               # Success notification
```

The extension works by:
1. Observing Gmail's DOM for the snooze menu
2. Injecting a natural language input field
3. Parsing user input with chrono-node
4. Automating Gmail's native "Pick date & time" modal
5. Showing a success notification

## Privacy & Security

- No external API calls
- No data collection or tracking
- Minimal permissions (activeTab only)
- Never reads or modifies email content
- All processing happens locally in your browser

## Troubleshooting

### Extension doesn't appear
- Verify you're on `mail.google.com`
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the Gmail tab

### Date parsing isn't working
- Ensure your input is unambiguous ("tomorrow 9am" vs just "tomorrow")
- Try more explicit dates ("Jan 10 2026" vs "soon")
- The extension uses future dates by default

### Modal automation fails
- Gmail's UI may have changed
- Try clicking the "Pick date & time" option manually
- Check the browser console for errors

## Contributing

Feel free to fork, modify, and improve this extension. The codebase is well-structured and TypeScript makes it easy to understand and extend.

## License

This project is open source and available for personal use. Not affiliated with Google or Gmail.
