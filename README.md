# VedaAI Assignments Frontend

A modern AI-assisted assignment and question-paper generation frontend built for speed, clarity, and classroom impact.

This project lets teachers create assignments, trigger AI question generation, monitor generation progress in real time, review generated papers, and export polished PDFs.

## Demo Screenshots

Add your screenshots in the paths below.

### 1. Dashboard / Assignments List
<img width="2549" height="1410" alt="image" src="https://github.com/user-attachments/assets/4aa98e55-3f42-4f98-9873-4cc25a5eea4c" />
<img width="2553" height="1254" alt="image" src="https://github.com/user-attachments/assets/3d09753d-8dfa-472e-bdef-7062d680f9a0" />


# Mobile View
<img width="412" height="897" alt="image" src="https://github.com/user-attachments/assets/b4dcc1ec-b3bc-4829-ad06-76fb7ca7524f" />
<img width="419" height="903" alt="image" src="https://github.com/user-attachments/assets/890b2dd1-de3e-4322-9c35-719db5d44b9d" />


### 2. Create Assignment Form

<img width="2553" height="1256" alt="image" src="https://github.com/user-attachments/assets/03baa81f-67a4-4063-8415-5dcf2ea0e110" />
<img width="2554" height="1266" alt="image" src="https://github.com/user-attachments/assets/7f32fe9a-47e9-476e-bbc6-e97613f73f66" />


### 3. Generation In-Progress UI

<img width="2557" height="1424" alt="image" src="https://github.com/user-attachments/assets/66a87bae-8826-4059-97b4-b29a1eac6fba" />
<img width="2559" height="1262" alt="image" src="https://github.com/user-attachments/assets/74567db0-5bb4-4961-86c0-f4e6a179840f" />
<img width="2559" height="1262" alt="image" src="https://github.com/user-attachments/assets/3d815b22-9142-452c-90ee-55aa2d67d49f" />


### 4. Generated Question Paper View

<img width="2546" height="1272" alt="image" src="https://github.com/user-attachments/assets/2d23b17a-e317-45f7-8cb9-4973bdd45bee" />
<img width="2549" height="1260" alt="image" src="https://github.com/user-attachments/assets/122710fd-b02a-4353-adfd-88b57f40564b" />


### 5. PDF Download Output


## Key Features

### Assignment Creation
- Rich assignment form with subject, grade, due date, duration, question-type configuration, difficulty distribution, and optional file upload
- Validation and user feedback through toast notifications

### Real-Time Generation Experience
- Automatic generation trigger after assignment creation
- Live progress updates via Socket.IO events
- Dedicated in-progress UI with percentage and status messaging

### Question Paper Review
- Structured paper view with school header, metadata, sections, and question cards
- Support for multiple question types: MCQ, short, long, true/false, fill in the blanks, diagram, numerical
- Regenerate per question or per section

### PDF Export
- Frontend HTML-to-PDF export for visual consistency with what users see on screen
- Improved output quality and faster repeat downloads

### Assignment Management
- Search and browse assignments from home dashboard
- Delete assignments
- Trigger generation for assignments that do not yet have generated questions

## Tech Stack

- React 18
- Redux Toolkit
- Redux Saga
- React Router v6
- Axios
- Socket.IO Client
- react-hot-toast
- lucide-react
- html2pdf.js
- react-scripts (CRA)

## Architecture Overview

### Frontend Layers
- UI Components: assignment forms, question paper components, layout components
- State Management: Redux slices for assignment and question paper domains
- Side Effects: Redux Saga for API orchestration and async flows
- Realtime: Socket service listens to generation events and updates store

### Data Flow
1. User submits assignment form
2. Frontend creates assignment via API
3. Frontend triggers generation job
4. Backend emits progress events over socket
5. Redux store updates progress and status
6. User opens generated paper and downloads PDF

## Project Structure

src/
- components/
	- assignment/
	- common/
	- layout/
	- questionPaper/
- hooks/
- pages/
	- HomePage/
	- CreateAssignmentPage/
	- ViewPaperPage/
- services/
	- api.js
	- socket.js
- store/
	- slices/
	- sagas/
- styles/
- utils/

## Environment Variables

Use .env in the project root.

REACT_APP_API_URL=http://api.aayushdevcreations.in/api
REACT_APP_SOCKET_URL=http://api.aayushdevcreations.in
REACT_APP_ASSIGNMENT_CREATE_TIMEOUT_MS=120000
GENERATE_SOURCEMAP=false

Notes:
- REACT_APP_API_URL must point to your backend API base path
- REACT_APP_SOCKET_URL must point to the Socket.IO server host
- GENERATE_SOURCEMAP=false is used to keep CI builds warning-free

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended

### Installation
1. Clone repository
2. Install dependencies

npm install

3. Configure .env
4. Start development server

npm start

The app runs on http://localhost:3000 by default.

## Available Scripts

- npm start: Runs app in development mode
- npm run build: Creates optimized production build
- npm test: Runs test runner

## API and Realtime Contracts

### Main REST Endpoints Used
- GET /assignments
- GET /assignments/:id
- POST /assignments
- DELETE /assignments/:id
- POST /assignments/:id/generate
- POST /papers/:id/regenerate
- GET /assignments/:assignmentId/paper
- GET /papers/:id/pdf

### Socket Events Consumed
- generation:progress
- generation:complete
- generation:error
- job:status

## Performance and UX Enhancements

- Assignment POST timing logs in browser console for diagnostics
- Long assignment-create timeout support through env
- PDF blob handling for efficient download operations
- Responsive dashboard and mobile sidebar behavior

## Build and CI Notes

For strict CI environments where warnings fail builds:
- Keep GENERATE_SOURCEMAP=false
- Run build in CI mode to validate:

CI=true npm run build

PowerShell:

$env:CI='true'; npm run build

## Troubleshooting

### API URL not picked from env
- Ensure .env has REACT_APP_API_URL
- Restart dev server after any .env change
- Verify value in browser by inspecting network request URL

### Socket connection issues
- Confirm REACT_APP_SOCKET_URL host is reachable
- Check backend CORS and Socket.IO transport support

### Build fails in CI with warnings
- Confirm GENERATE_SOURCEMAP=false in .env
- Reinstall dependencies if lockfile drift is suspected

## Future Scope

- Role-based auth and institute-level access control
- Multi-language question generation
- Rubric-aware auto-grading workflows
- Rich analytics on question quality and class performance
- Offline-first support for low-connectivity schools

