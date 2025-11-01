# LegalView Frontend

A modern React frontend for the LegalView AI-powered legal document assistant.

## Features

- **Document Upload**: Drag & drop interface for uploading legal documents
- **AI Chat Interface**: Ask questions and get answers based on your documents
- **Document Library**: View and manage all uploaded documents
- **Responsive Design**: Modern UI built with Tailwind CSS
- **TypeScript**: Full type safety and better development experience

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Dropzone** for file uploads
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see main project README)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── DocumentUpload.tsx    # File upload interface
│   ├── ChatInterface.tsx     # AI chat interface
│   └── DocumentList.tsx      # Document management
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind
```

## Development

- **Hot Reload**: Changes are reflected immediately in the browser
- **TypeScript**: Full type checking and IntelliSense
- **ESLint**: Code quality and consistency
- **Tailwind**: Utility-first CSS framework

## API Integration

The frontend communicates with the FastAPI backend for:
- Document uploads
- AI-powered queries
- Document management

Make sure the backend is running on `http://localhost:8000` before using the frontend.

## Customization

- **Colors**: Modify the color scheme in `tailwind.config.js`
- **Components**: Add new components in the `components/` directory
- **Styling**: Use Tailwind classes or add custom CSS in `index.css`
