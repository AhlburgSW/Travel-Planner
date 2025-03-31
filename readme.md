Ahlburg Travel Planner
======================

Overview:
---------

Ahlburg Travel Planner is a full-stack, monolithic web application designed for collaborative travel planning. It allows you to manage activities, hotels, and expenses on an interactive, dark-themed map. Users can add, edit, and delete entries; upload and manage supporting documents (such as images and PDFs); and view integrated weather data and navigation.

Features:
---------

-   Interactive Map: Manage activities, hotels, and expenses on a live map.

-   Marker Management: Add, edit, and delete markers directly from the map.

-   Document Uploads: Upload, preview, download, and delete documents for activities and hotels.

-   Navigation Integration: Open locations in Google Maps via built-in navigation icons.

-   Geolocation: Display your current position using a custom red marker.

-   Weather Information: View current weather data at specific locations.

-   German Date Formatting: All dates are formatted in the German style.

-   Dark Theme: Modern, responsive design with dark mode and orange accents.

-   Open Source: Licensed under the GPL‑3.0 License.

Project Structure:
------------------

The project structure is as follows:

├── craco.config.js // Craco configuration for customizing Create React App\
├── package.json // Project dependencies and scripts\
├── package-lock.json // Lock file for project dependencies\
├── public\
│   ├── index.html // Main HTML file\
│   └── logo.svg // Application logo\
├── readme.md // This README file\
├── server.js // Express server and API endpoints\
├── src\
│   ├── App.css // Application styles\
│   ├── App.js // Main React application\
│   ├── index.js // React entry point\
│   └── package-lock.json // (Optional) Additional lock file if used\
└── uploads // Directory for uploaded files

Installation:
-------------

1.  Clone the Repository:\
    git clone <https://github.com/AhlburgSW/Travel-Planner.git>\
    cd Travel-Planner

2.  Install Dependencies:\
    In the project root, run:\
    npm install

    Note: This monolithic project uses one package.json file for both the backend and frontend.

3.  Environment Configuration:\
    Create a .env file in the project root with the following variables (adjust values as needed):

    PORT=3001\
    JWT_SECRET=your_jwt_secret_key\
    OPENWEATHERMAP_API_KEY=your_openweathermap_api_key\
    DB_STORAGE=database.sqlite\
    SUPERUSER_USERNAME=admin\
    SUPERUSER_PASSWORD=password

Running the Application:
------------------------

Development Mode:\
npm run dev

This launches:

-   The Express backend (server.js) on port 3001.

-   The React application (using craco) on port 3000.

Production Build:

1.  Build the frontend:\
    npm run build

2.  Set NODE_ENV=production and start the server:\
    npm start

The Express server is configured to serve static files from the production build.

License:
--------

This project is licensed under the GPL‑3.0 License.\
(See https://www.gnu.org/licenses/gpl-3.0.en.html for details.)

Contributing:
-------------

Contributions are welcome! Please fork the repository and submit pull requests with your improvements. For any issues or suggestions, open an issue on the GitHub repository:\
<https://github.com/AhlburgSW/Travel-Planner>

Contact:
--------

For questions, issues, or feedback, please open an issue on the GitHub repository or contact the project maintainers.
