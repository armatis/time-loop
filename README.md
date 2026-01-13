# ⚡ PowerLoop

**PowerLoop** is a professional-grade, flexible interval timer and workout runner built for precision and ease of use. Whether you're doing Tabata, HIIT, or Pomodoro, PowerLoop helps you stay on track with a dynamic, responsive interface.

## ✨ Key Features

- **🔄 Nested Loops**: Create complex intervals with multi-level nesting for advanced workout routines.
- **🏗️ Drag-and-Drop Editor**: Easily reorder intervals and loops using an intuitive drag-and-drop interface.
- **🔊 Audio Cues**: Crystal clear audio notifications for countdowns, interval switches, and completion.
- **⚡ Presets**: Quick-start with built-in templates like Tabata, EMOM, and Pomodoro.
- **📱 Responsive Design**: A stunning, modern UI that looks great on any device with full-screen runner mode.
- **🛑 Screen Wake Lock**: Keeps your screen on during active workouts so you never lose track.
- **💾 Local Persistence**: Workouts are automatically saved to your local storage.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Drag-and-Drop**: [@dnd-kit/core](https://dnd-kit.com)
- **Audio Engine**: [Howler.js](https://howlerjs.com)
- **Icons**: [Lucide React](https://lucide.dev)

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: UI components including the Dashboard, Runner, and Interval editors.
- `src/lib`: Core utilities and workout presets.
- `src/store`: Zustand store for workout state and timer logic.
- `src/types`: TypeScript definitions for workouts, intervals, and loops.

---

Built with ⚡ by Antigravity.
