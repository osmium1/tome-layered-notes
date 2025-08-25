# Tome - Layered Note-Taking for Enhanced Learning

A sophisticated web application designed to revolutionize how you take notes and retain information through active recall methodology.

## Features

### 🧠 Hierarchical Learning System
- **Layered Content Structure**: Organize information in multiple layers (L1-L4) for optimal learning
- **Active Recall**: Content defaults to collapsed state, encouraging memory retrieval before revealing answers
- **Paste-to-Create**: Simply paste pre-formatted text with layer tags and watch it transform into interactive notes

### 📚 Organized Knowledge Management
- **Three-Tier Hierarchy**: Binders → Notebooks → Notes for intuitive organization
- **Visual Organization**: Color-coded binders and clean, academic interface
- **Search & Navigation**: Easy browsing through your knowledge base

### 🎨 Layer Types
- **L1 (Root/Mnemonic)**: Main concepts and memory aids
- **L2 (Keywords)**: Key terms displayed as interactive pills
- **L3 (Definitions)**: Detailed explanations and descriptions
- **L4 (Examples)**: Practical examples and applications

### 🔐 User Management
- **Secure Authentication**: Email-based signup and login
- **Personal Workspace**: Each user gets their own private knowledge base
- **Sample Content**: New users receive a "Getting Started" guide

### 🌙 Modern Interface
- **Dual Themes**: Light and dark mode support
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Clean Typography**: Optimized for reading and focus

## Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account for database and authentication

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd tome-layered-notes
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. Set up the database:
Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor:
- `001_create_tables.sql` - Creates the database schema
- `002_create_profile_trigger.sql` - Sets up user profile automation
- `003_create_sample_data.sql` - Creates the sample data function

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your application.

## Usage

### Creating Your First Note

1. **Sign up** for an account and verify your email
2. **Navigate** to your dashboard where you'll find a sample binder
3. **Create a new note** in any notebook
4. **Click "Click to add content"** to open the paste-to-create modal
5. **Paste structured content** using layer tags:

\`\`\`
[L1] Photosynthesis
The process by which plants convert light energy into chemical energy.

[L2] Key Components
chlorophyll, sunlight, carbon dioxide, water

[L3] Chemical Equation
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

[L4] Example
A leaf absorbing sunlight and producing glucose and oxygen.
\`\`\`

6. **Watch your content transform** into an interactive, layered note structure

### Layer Tag Format

- `[L1]` - Main concepts (displayed as headers)
- `[L2]` - Keywords (displayed as pills)
- `[L3]` - Definitions (collapsible content blocks)
- `[L4]` - Examples (indented example blocks)

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
