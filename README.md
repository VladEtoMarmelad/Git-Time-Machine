# Git Time Machine Visualizer

An interactive web application that visualizes the history of a public GitHub repository. The application fetches the repository's commit history and presents an interactive timeline of changes. You can see which files were modified in each commit and view the full content of any file at any point in history.

This project is a demonstration of using a NestJS backend to interact directly with the Git command-line interface to perform complex analysis and serve the results to a modern Next.js frontend.

## Features

-   **Analyze Any Public Repo:** Simply provide a public GitHub URL to start the analysis.
-   **Interactive Commit History:** Browse through the commit history on a timeline.
-   **File Change Visualization:** See exactly which files were changed in each commit.
-   **On-Demand Content Viewer:** Click on any file in any commit to view its full text content at that specific point in time.
-   **Powerful Backend:** Built with NestJS to orchestrate Git commands and serve data.
-   **Modern Frontend:** A responsive and fast user interface built with Next.js and React.

## Tech Stack

#### **Backend (`git-time-machine-backend`)**

-   **Framework:** [NestJS](https://nestjs.com/)
-   **Job Queue:** [Bull](https://github.com/OptimalBits/bull) / [BullMQ](https://bullmq.io/)
-   **Database/Cache:** [Redis](https://redis.io/)
-   **Language:** TypeScript
-   **Runtime:** Node.js

#### **Frontend (`git-time-machine-frontend`)**

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Library:** [React](https://reactjs.org/)
-   **Language:** TypeScript / JavaScript

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Node.js:** v18.x or later
-   **Git:** Must be installed and accessible from your system's command line.
-   **Docker:** Required to run the Redis instance.

## Installation

Follow these steps to get the project set up on your local machine.

**1. Install Backend Dependencies**

Navigate to the backend directory and install the required npm packages.

```bash
cd git-time-machine-backend
npm install
```

**2. Install Frontend Dependencies**

From the project root, navigate to the frontend directory and install its packages.

```bash
# Make sure you are in the project's root directory first
cd git-time-machine-frontend
npm install
```

## Running the Application

To run the application, you will need to start Redis, the backend, and the frontend. It's best to use separate terminal windows for this.

**1. Start Redis**

The backend requires Redis. Run the following command to start a Redis container using Docker:

```bash
docker run --name git-time-machine-redis -p 6379:6379 -d redis
```

**2. Start the Backend Server**

In your terminal, navigate to the backend directory and run the development server.

```bash
# Navigate to the backend directory
cd path/to/your-project/git-time-machine-backend

# Run the server
npm run start
```

The NestJS backend will start and listen for requests. By default, it runs on `http://localhost:3030`.

**3. Start the Frontend Server**

In another terminal, navigate to the frontend directory and run the development server.

```bash
# Navigate to the frontend directory
cd path/to/your-project/git-time-machine-frontend

# Run the server
npm dev
```

The Next.js frontend will start. By default, it runs on `http://localhost:3000`.

**4. Open The App!**

You can now access the Git Time Machine by opening your web browser and navigating to:

[**http://localhost:3000**](http://localhost:3000)