# ChromaBin
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thebongy/generated-app-20251003-072130)
**[Live Demo](https://your-deployment-url.pages.dev/)** (Replace with your actual deployment link)
ChromaBin is a sophisticated, minimalist pastebin application designed for developers and creators. It allows users to effortlessly share text snippets and images through secure, shareable links. The application features automatic syntax highlighting for code, optional password protection for privacy, and customizable expiration times for temporary shares. With a clean, intuitive interface and dedicated 'raw' links for direct content access, ChromaBin prioritizes both aesthetic appeal and functional clarity, making it the perfect tool for quick and beautiful content sharing.
## 🖼️ Screenshots
*(Add screenshots of the application here, e.g., the creation page and the view page)*
![ChromaBin Create Page](https://via.placeholder.com/800x500.png?text=ChromaBin+Create+Page)
_The intuitive paste creation interface._
![ChromaBin View Page](https://via.placeholder.com/800x500.png?text=ChromaBin+View+Page)
_Viewing a syntax-highlighted code snippet._
## ✨ Key Features
-   **Text & Image Pasting**: Seamlessly paste code snippets or upload images via a clean, tabbed interface.
-   **Syntax Highlighting**: Automatic and beautiful code highlighting with theme-aware (light/dark) support.
-   **Password Protection**: Secure your pastes with a password for private sharing.
-   **Custom Expiration**: Set pastes to expire after 10 minutes, 1 hour, 1 day, or 1 week.
-   **Shareable Links**: Get a short, clean link to share your content.
-   **Raw Content View**: Access the raw text or image file directly, perfect for scripts or embedding.
-   **Minimalist UI**: A clean, focused, and visually stunning interface built with shadcn/ui and Tailwind CSS.
-   **Responsive Design**: Flawless experience across all device sizes, from mobile to desktop.
## 🚀 Technology Stack
-   **Frontend**:
    -   [React](https://reactjs.org/)
    -   [Vite](https://vitejs.dev/)
    -   [React Router](https://reactrouter.com/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
    -   [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for form validation
    -   [Framer Motion](https://www.framer.com/motion/) for animations
-   **Backend**:
    -   [Cloudflare Workers](https://workers.cloudflare.com/)
    -   [Hono](https://hono.dev/)
-   **Storage**:
    -   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
-   **Language**:
    -   [TypeScript](https://www.typescriptlang.org/)
## 🛠️ Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.
### Installation & Local Development
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/chromabin.git
    cd chromabin
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
3.  **Run the development server:**
    This command starts the Vite frontend and the Wrangler development server for the backend worker concurrently.
    ```sh
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.
## 📁 Project Structure
The project is organized into three main directories:
-   `src/`: Contains all the frontend React application code, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Cloudflare Worker code, built with Hono. This is where API routes and business logic reside.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.
## ☁️ Deployment
This project is designed for easy deployment to the Cloudflare network.
1.  **Login to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```sh
    wrangler login
    ```
2.  **Deploy the application:**
    This command will build the frontend application and deploy it along with the worker to your Cloudflare account.
    ```sh
    bun run deploy
    ```
Alternatively, you can deploy directly from your GitHub repository with a single click.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thebongy/generated-app-20251003-072130)
## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.