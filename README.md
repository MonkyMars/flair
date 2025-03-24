# Flair - Mobile Camera App

Flair is a modern, stylish mobile web app for capturing and sharing videos and selfies with personality and flair. Built with Next.js and integrated with Supabase for seamless storage.

![Flair App Preview](https://i.imgur.com/placeholder.png)

## Features

- 📱 Mobile-optimized UI/UX
- 🎥 Video recording with playback controls
- 📸 High-resolution selfie mode
- 🔊 Audio muting during recording and playback
- 🖼️ View and preview your last recordings and selfies
- 🔄 Real-time status updates and error notifications
- ⚡ Fast and responsive interface with intuitive controls

## Technical Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS with custom design system
- **Storage**: Supabase Storage
- **Media Access**: Web MediaRecorder API
- **Icons**: React Icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Setup Supabase:
   - Create a Supabase project
   - Create two storage buckets: `videos` and `selfies`
   - Set public access permissions for both buckets
   - Copy your Supabase URL and anon key to a `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) on your mobile device or use a mobile viewport in your browser's dev tools.

## Usage

- **Recording Video**: Press the big red button to start recording
- **Taking Selfies**: Toggle selfie mode with the camera icon, then press the blue button
- **Muting Audio**: Use the volume icon to mute/unmute
- **View Last Recording**: Tap the thumbnail in the bottom right corner
- **Fullscreen Mode**: Use the fullscreen button for a more immersive experience

## Mobile Usage Tips

- Allow camera and microphone permissions when prompted
- For best performance, use Chrome or Safari on modern mobile devices
- Add to your home screen for a more app-like experience

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with ❤️ and ✨ Flair!
