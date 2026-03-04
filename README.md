# CCAPDEV-MCO2-ArchersFreelanceHub

CCAPDEV-MCO2-ArchersFreelanceHub/
│
├── client/                                      # React frontend application
│   ├── public/                                   # Static assets served directly (images, index.html)
│   ├── src/                                       # Main source code folder
│   │   ├── components/                             # Reusable UI pieces (buttons, cards, navbar)
│   │   ├── pages/                                  # Full page components (Landing, Login, Dashboard)
│   │   ├── services/                               # API calls to backend
│   │   ├── styles/                                 # CSS files for styling
│   │   └── utils/                                  # Helper functions (validators, formatters)
│   └── package.json                                # Frontend dependencies and scripts
│
├── server/                                      # Express backend application
│   ├── controllers/                               # Business logic for each route
│   ├── routes/                                    # API endpoint definitions
│   ├── middleware/                                 # Interceptors (auth, validation, error handling)
│   ├── database/                                   # Database connection and SQL files
│   └── package.json                                # Backend dependencies and scripts
│
├── .gitignore                                      # Files to exclude from git
└── README.md                                       # Project overview and setup instructions