// Dynamically determine backend URL
// This assumes the backend is running on the same machine as the frontend, on port 5000.
// If you access frontend via "192.168.x.x", it will try to hit "192.168.x.x:5000".
export const BACKEND_URL = `http://${window.location.hostname}:5000`;
