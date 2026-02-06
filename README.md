# Developer Portfolio

A clean, elegant, and professional developer portfolio website inspired by Antigravity, built with Vite, Vanilla JavaScript, and Three.js.

## Features

- **Minimalist Dark Mode Design**
- **Three.js Particle Background**
- **Smooth Page Transitions**
- **JSON-based Project Management**
- **Responsive Layout**

## Project Structure

```
/src
  /three        # Three.js background scene
  /components   # Reusable UI components (Navbar, Cards)
  /sections     # Page sections (Hero, Projects, Contact)
  /data         # Data files (projects.json)
  style.css     # Global styles and variables
  main.js       # Entry point
```

## How to Run

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Development Server**

   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Customization

- **Projects**: Edit `src/data/projects.json` to add your own projects.
- **Colors & Fonts**: Edit `src/style.css` CSS variables.
- **Content**: Update text in `src/sections/*.js`.

## Tech Stack

- Vite
- Vanilla JavaScript
- Three.js
- CSS3
