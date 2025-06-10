# Docusaurus Plugin MDC Rules

[![NPM Version](https://img.shields.io/npm/v/docusaurus-plugin-mdc-rules)](https://www.npmjs.com/package/docusaurus-plugin-mdc-rules)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-94%2F94-green.svg)](#testing)

A custom Docusaurus plugin that processes `.mdc` files from `.cursor/rules/` directory into documentation pages with automatic cross-reference resolution and sidebar generation.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [API Reference](#api-reference)

## Features

- **Automatic File Discovery**: Recursively scans `.cursor/rules/` for `.mdc` files
- **Markdown Processing**: Converts markdown to HTML using remark/rehype pipeline
- **Content Processing**: Extracts frontmatter and processes markdown content
- **Cross-Reference Resolution**: Converts relative `.mdc` references to internal documentation links
- **Sidebar Generation**: Auto-generates navigation sidebar matching directory structure
- **Metadata Display**: Shows file metadata in documentation pages
- **Build-Time Validation**: Validates cross-references and warns about broken links
- **TypeScript Support**: Full TypeScript implementation with type definitions

## Installation

Install the plugin via npm:

```bash
npm install docusaurus-plugin-mdc-rules
```

Or with yarn:

```bash
yarn add docusaurus-plugin-mdc-rules
```

## Configuration

Add the plugin to your `docusaurus.config.ts`:

```typescript
export default {
  plugins: [
    [
      'docusaurus-plugin-mdc-rules',
      {
        id: 'docusaurus-plugin-mdc-rules',
        sourceDir: '.cursor/rules',
        targetPath: 'rules',
        includeMetadata: true
      }
    ],
  ],
  // ... rest of your config
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sourceDir` | `string` | `.cursor/rules` | Source directory containing `.mdc` files |
| `targetPath` | `string` | `rules` | Target path for generated documentation routes |
| `includeMetadata` | `boolean` | `true` | Whether to include metadata in generated documents |
| `mainRule` | `string` | `main` | Main rule file name without extension |
| `component` | `string` | `@site/src/components/RulePage/index.tsx` | Component for rendering rule pages |

## Usage

### File Structure

The plugin expects your `.cursor/rules/` directory to contain `.mdc` files:

```
.cursor/rules/
├── main.mdc              # Main rules file
├── task-levels.mdc       # Task complexity levels
├── adr-structure.mdc     # ADR naming and structure
└── modes/
    ├── init.mdc          # Init mode rules
    ├── plan.mdc          # Plan mode rules
    ├── implement.mdc     # Implement mode rules
    ├── doc.mdc           # Doc mode rules
    └── reflect.mdc       # Reflect mode rules
```

### Cross-References

Use relative paths to reference other `.mdc` files:

```markdown
See also: [Init Mode](./modes/init.mdc) for more details.
```

The plugin automatically converts these to proper documentation links:

```markdown
See also: [Init Mode](/rules/modes/init) for more details.
```

### Markdown Processing

The plugin uses a modern remark/rehype pipeline to process markdown content:

- **Remark**: Parses markdown to MDAST (Markdown Abstract Syntax Tree)
- **Remark-Rehype**: Converts MDAST to HAST (Hypertext Abstract Syntax Tree)
- **Rehype-Stringify**: Converts HAST to HTML string

This approach provides:
- **Standard Compliance**: Full CommonMark support
- **Extensibility**: Easy to add remark/rehype plugins for additional features
- **Performance**: Efficient processing with proper error handling
- **Future-Proof**: Can easily add GFM, Mermaid, or other markdown extensions

#### Supported Markdown Features

- Headings (`# ## ###`)
- Text formatting (**bold**, *italic*)
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Links and images
- Blockquotes
- Tables (with future GFM plugin)

#### Error Handling

If markdown processing fails, the plugin gracefully falls back to displaying the raw content wrapped in `<pre>` tags, ensuring the build never fails due to malformed markdown.

### Generated Routes

The plugin generates routes based on your file structure:

- `.cursor/rules/main.mdc` → `/rules/main`
- `.cursor/rules/modes/init.mdc` → `/rules/modes/init`
- `/rules` → redirects to `/rules/main` (if main.mdc exists)

## Architecture

The plugin consists of several core components:

### ContentLoader (`src/content-loader.ts`)
- Discovers `.mdc` files using `fast-glob`
- Extracts frontmatter and content using custom parser
- Processes markdown to HTML using remark/rehype pipeline
- Handles async processing with proper error handling
- Returns structured `RuleContent[]` array with processed HTML content

### LinkResolver (`src/link-resolver.ts`)
- Detects cross-reference patterns using regex `/\.\/[^\s\)]+\.mdc/g`
- Converts relative references to absolute URLs
- Validates referenced files and logs warnings for broken links

### SidebarGenerator (`src/sidebar-generator.ts`)
- Generates sidebar configuration from directory structure
- Creates category objects for subdirectories

### MetadataParser (`src/metadata-parser.ts`)
- Extracts and processes file metadata
- Generates metadata tables for documentation display
- Handles various metadata formats and edge cases

## Development

### Prerequisites

- Node.js ≥18.0
- TypeScript ≥5.6
- Docusaurus ≥3.8.0

### Build

```bash
# Build the plugin
npm run build

# Watch for changes during development
npm run watch
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Testing

The plugin includes comprehensive unit tests covering all core functionality:

```bash
# Run all tests
npm test

# Generate coverage report
npm run test:coverage
```

## API Reference

### PluginConfig Interface

```typescript
interface PluginConfig {
  sourceDir: string;
  targetPath: string;
  includeMetadata: boolean;
  mainRule: string;
  component: string;
}
```

### RuleContent Interface

```typescript
interface RuleContent {
  filePath: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  permalink: string;
}
```

### Processing Results

The plugin provides detailed processing information:

```typescript
interface ProcessingResult {
  content: RuleContent[];
  crossReferences: CrossReference[];
  warnings: string[];
  errors: string[];
}
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request
