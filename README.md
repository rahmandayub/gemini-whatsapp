# Gemini WhatsApp

This project allows you to run Gemini WhatsApp using the Gemini API. Follow the steps below to set up and run the project.

## Prerequisites

Before you begin, ensure you have the following installed:

-   Gemini API Key
-   Node.js
-   npm
-   Chromium/Chrome browser

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/gemini-whatsapp.git
    cd gemini-whatsapp
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` or simply rename `.env.example` file to `.env` file in the root directory and add your Gemini API key and Chromium directory:

    ```plaintext
    API_KEY=your_gemini_api_key
    CHROME_BIN=/path/to/chromium
    ```

## Running the Project

To start the project, run:

```bash
node app
```

then scan the qr code that displayed in terminal from your WhatsApp mobile app

## Usage

Once the project is running, you can use the Gemini WhatsApp functionalities as per the provided documentation.

## Contributing

Feel free to submit issues or pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
