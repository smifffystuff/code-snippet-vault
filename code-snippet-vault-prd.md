# 📘 Product Requirements Document (PRD)

## Project Name: Code Snippet Vault

## Overview

**Code Snippet Vault** is a web application for developers to store, organize, and search useful code snippets. The tool supports multiple programming languages and provides features like tagging, syntax highlighting, and full-text search.

## Goals

- Allow developers to save, view, and manage code snippets in a personal vault.
- Support multiple languages with syntax highlighting.
- Enable filtering and searching snippets by language, tag, or keyword.
- Provide a clean and responsive UI for ease of use.

## Target Audience

- Software developers and technical users who want a simple personal knowledge base for reusable code.

## Tech Stack

### Frontend
- React
- Tailwind CSS
- React Router (optional for routing)
- Prism.js or Highlight.js for syntax highlighting

### Backend
- Node.js
- Express
- MongoDB (or JSON file storage for MVP)

## Features

### MVP Features
- [x] Create a new snippet:
  - Title
  - Programming Language
  - Tags
  - Description
  - Code content
- [x] View all saved snippets
- [x] Filter by language or tags
- [x] Full-text search by title/description
- [x] Syntax highlighting when viewing code

### Stretch Goals
- User authentication (JWT/Auth0)
- GitHub Gist integration
- Dark mode / Light mode toggle
- Mobile responsiveness
- Import/export to/from Markdown or JSON

## Non-Goals

- Collaborative features or multi-user access
- Public snippet sharing (for MVP)

## Success Criteria

- User can create, update, and delete snippets
- Code is displayed with correct syntax highlighting
- Filtering and searching are performant
- UI is intuitive and accessible on desktop and mobile

## Wireframe (Text-based)

```
+--------------------------------------+
|          Code Snippet Vault         |
+--------------------------------------+

[ + New Snippet ]        [ Search 🔍 ]

[Language Dropdown]  [Tag Filter]

------------------------------------------------
Title: "Async Await Wrapper"
Language: JavaScript
Tags: async, promise

function asyncWrapper(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}
------------------------------------------------
```

## Milestones

| Date        | Milestone                   |
|-------------|-----------------------------|
| Day 1       | Project scaffolding (React + Node) |
| Day 2       | Create backend API and MongoDB models |
| Day 3       | Build frontend with create/view features |
| Day 4       | Add search, filtering, and syntax highlighting |
| Day 5+      | Polish UI, handle edge cases, and deploy |

## Risks

- Time may be tight to implement everything in a weekend — keep scope focused.
- Code highlighting libraries can be large or hard to configure.

## Notes

- For simplicity, you can start with JSON file storage before moving to MongoDB.
- Keep backend and frontend as separate services (optionally containerized with Docker).
