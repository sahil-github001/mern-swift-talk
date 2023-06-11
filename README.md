# SwiftTalk Chat Application

SwiftTalk is a chat application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to create accounts, log in, and engage in real-time messaging with other registered users. The application utilizes WebSocket technology for seamless and instant communication.

## Features

- User registration and login: Users can create an account with a unique username and password or log in if they already have an account.
- Real-time messaging: Users can exchange real-time messages with each other, allowing for instant communication.
- Online status: Users can see the online status of other registered users. The status is dynamically updated when users are online or offline.
- File sharing: Users can send files to other users within the chat application. The recipient can easily access and download the shared files.

## Technologies Used

- React
- Tailwind CSS
- MongoDB
- Express
- Node.js
- Axios
- WebSocket

## Folder Structure

The project folder structure is organized as follows:

- `client`: Contains the React client-side code.
- `server`: Contains the server-side code.
- `server/index.js`: The main server file.

## Installation

Before running the SwiftTalk application, make sure you have the following dependencies installed:

- Node.js
- Nodemon
- Yarn

To set up the SwiftTalk application, follow these steps:

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the server folder: `cd server`
3. Create a `.env` file with the following contents:

MONGO_URL=<your-mongodb-connection-string>
JWT_SECRET=<random-string>
CLIENT_URL="http://localhost:5173"

Replace `<your-mongodb-connection-string>` with your actual MongoDB connection string. Generate a random string for `JWT_SECRET`.

4. Install server dependencies: `yarn`
5. Start the server: `nodemon index.js`
6. Open a new terminal and navigate to the client folder: `cd client`
7. Install client dependencies: `yarn`
8. Start the client: `yarn dev`

The SwiftTalk application should now be up and running on your local machine.

## Usage

1. Open your web browser and go to `http://localhost:5173` to access the SwiftTalk application.
2. If you are a new user, create an account by providing a unique username and password. Once registered, you will be redirected to the chat page.
3. If you already have an account, enter your username and password to log in and access the chat page.
4. In the chat application, you will see a sidebar with a list of registered users. The online status of each user is indicated.
5. Click on a user from the sidebar to open a chat interface and send real-time messages to the selected user.
6. To log out, click on the logout option.
