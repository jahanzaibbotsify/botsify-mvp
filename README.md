# Botsify Chat - Modern Vue Chat Application

A modern chat application built with Vue 3, TypeScript, and Vite.

## Features

- Real-time chat interface
- Markdown support with syntax highlighting
- User authentication
- Chat history
- Image cropping and uploads
- Responsive design

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Vue Router
- Pinia for state management
- Marked and Highlight.js for markdown rendering
- Day.js for date formatting
- OpenAI integration
- Vue Advanced Cropper for image manipulation

## Setup Instructions

### Prerequisites

- Node.js (v16.0.0 or higher recommended)
- npm or yarn
- OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd botsify-chat
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up your OpenAI API key
   
   There are two ways to provide your OpenAI API key:
   
   **Option 1:** Create a `.env.local` file in the root directory with the following content:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Option 2:** Enter your API key in the Settings page of the application after starting it.

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Build for production
```bash
npm run build
# or
yarn build
```

6. Preview production build
```bash
npm run preview
# or
yarn preview
```

## Project Structure

- `/src` - Source code
  - `/assets` - Static assets
  - `/components` - Reusable Vue components
  - `/layouts` - Layout components
  - `/router` - Vue Router configuration
  - `/stores` - Pinia stores
  - `/types` - TypeScript type definitions
  - `/views` - Page components

## Environment Variables

The application uses the following environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key for chat functionality |

## License

MIT
