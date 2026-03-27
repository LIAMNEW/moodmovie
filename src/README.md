# MoodMovie

MoodMovie is an AI-powered movie recommendation web application that helps you find the perfect film based on your current mood and energy level. Say goodbye to endless scrolling and hello to instant, personalized movie picks.

## Features

- **AI Vibe Match:** Describe how you're feeling in your own words, and our AI will analyze your vibe to find the perfect movie match.
- **Manual Mood Picker:** Prefer a quick selection? Choose from a curated list of moods (Happy, Sad, Anxious, Romantic, Tired, Motivated, Bored, Cozy, Intense, Silly) and dial in your energy level.
- **Smart Recommendations:** Get 5 unique, diverse movie recommendations tailored to your exact emotional state.
- **Rich Movie Data:** View high-quality posters, descriptions, IMDb ratings, runtimes, directors, and genres for every recommendation.
- **Watch History:** Keep track of the movies you've watched and easily save your favorites. The app learns from what you skip to improve future suggestions.
- **Share Your Vibe:** Found a great match? Generate a beautiful "Share Card" to show friends what you're watching tonight.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Animations:** Framer Motion for smooth, interactive UI transitions and glassmorphism effects.
- **Backend & Database:** Base44 BaaS (Backend-as-a-Service) for entity management (`Movie` and `History` tables).
- **AI Integrations:** Base44 Core LLM integrations for analyzing natural language prompts, generating diverse movie recommendations, and fetching high-resolution movie posters in real-time.

## How it Works

1. **Input your Mood:** Either type a description of your day or manually select a mood and energy level.
2. **AI Analysis:** The app securely queries an LLM to map your input to structured movie criteria, fetching matches from the database or generating new diverse picks if needed.
3. **Tonight's Picks:** Browse through your personalized movie cards. Choose "I'll watch this" to add it to your history, or "Not feeling it" to skip and refine your algorithm.

## Getting Started

As this is built on the Base44 platform, ensure you have your environment set up and the necessary Base44 SDK initialized.

1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

---
*Built to make movie nights effortless.*