# BeamDesignTS

A comprehensive beam design application built with React, TypeScript, and Vite. This tool allows structural engineers to perform beam design calculations with various materials including steel, timber, and concrete.

## Features

- Support for multiple materials (steel, timber, concrete)
- Accurate self-weight calculations based on material density
- Load combination management
- Deflection limit checks
- Save and load design data
- Responsive user interface

## Recent Fixes

- Fixed timber density values for accurate self-weight calculations
- Improved array handling in localStorage to prevent "prevLoads is not iterable" errors
- Enhanced error recovery for network connection issues
- Added comprehensive test suite

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/BeamDesignTS.git
cd BeamDesignTS

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Building

```bash
# Build for production
npm run build
```

### Testing

```bash
# Run test suite
npm run test
```

See [TESTING.md](TESTING.md) for detailed testing information.

## Project Structure

- `src/components/`: React components
- `src/data/`: Data files (material catalogs, load combinations)
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions
- `src/tests/`: Test files

## Technology Stack

- React (v19)
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components

## Contributing

Before pushing changes to master, ensure:

1. All TypeScript compilation passes (`npx tsc --noEmit`)
2. ESLint checks pass (`npm run lint`)
3. All tests pass (see [TESTING.md](TESTING.md))
4. Your changes are well-documented

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
